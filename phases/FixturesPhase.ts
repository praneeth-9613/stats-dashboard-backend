import { TeamResponse } from "../api/types/RawTeam";
import { SyncContext } from "../application/types/Common";
import { fetchFixtures } from "../helpers/ApiHelpers";
import { FixtureRepository } from "../persistence/repositories/FixtureRepository";
import { FixtureMapper } from "../application/mappers/FixtureMapper";
import { FixtureData } from "../application/types/FixtureData";
import { Fixture, FixtureStatus } from "../persistence/entities/Fixture";
import { FixtureAudit } from "../persistence/entities/FixtureAudit";
import { FixturesPhaseOutput } from "../application/types/PhaseOutput";
import { FixtureEntityMapper } from "../persistence/mappers/FixtureEntityMapper";
import { FixtureAuditRepository } from "../persistence/repositories/FixtureAuditRepository";
import { FixtureComparator } from "../comparators/FixtureComparator";
import { SyncPhase } from "./SyncPhase";
import { loadMatchesPlayerStats } from "../helpers/StorageHelpers";

export class FixturesPhase extends SyncPhase<"add_fixtures" | "reschedule_fixtures" | "mark_for_processing_fixtures"> {

    private phaseTotal = 0;

    protected readonly steps = [
        "add_fixtures",
        "reschedule_fixtures",
        "mark_for_processing_fixtures",
    ] as const;

    constructor(protected context: SyncContext, private readonly teamResponse: TeamResponse, private readonly fixtureMapper: FixtureMapper, private readonly fixtureEntityMapper: FixtureEntityMapper, private readonly fixtureComparator: FixtureComparator, private readonly fixtureRepository: FixtureRepository, private readonly fixtureAuditRepository: FixtureAuditRepository) { super(context); }

    async run(): Promise<FixturesPhaseOutput> {
        const {
            leagueSeasonTeamIdentifier
        } = this.context;

        // API Data
        const latestFixtures = await fetchFixtures(this.teamResponse);

        const latestFixtureData = this.fixtureMapper.toFixtureData(latestFixtures, leagueSeasonTeamIdentifier);

        // DB Data
        const storedFixtures = await this.fixtureRepository.findByLeagueSeasonTeam(leagueSeasonTeamIdentifier);

        const storedFixtureIds = new Set(
            storedFixtures.map(fixture => fixture.matchId)
        );

        // Discover new / rescheduled fixtures
        const latestFixturesById = new Map(
            latestFixtureData.map(fixture => [fixture.matchId, fixture]),
        );

        const fixturesAdded = latestFixtureData.filter(
            fixture => !storedFixtureIds.has(fixture.matchId)
        );

        const fixturesRescheduled = storedFixtures.filter(
            storedFixture => {
                const latestFixture =
                    latestFixturesById.get(storedFixture.matchId);

                return (
                    latestFixture !== undefined &&
                    (new Date(latestFixture.fixtureDate).getTime() !==
                        storedFixture.fixtureDate.getTime())
                );
            }
        );

        const fixturesNewlyCompleted = storedFixtures.filter(storedFixture => {
            const latestFixture =
                latestFixturesById.get(storedFixture.matchId);

            if (!latestFixture?.completed) {
                return false;
            }

            if (storedFixture.completed) {
                return false;
            }

            return (
                storedFixture.fixtureStatus !== FixtureStatus.MARKED_FOR_PROCESSING &&
                storedFixture.fixtureStatus !== FixtureStatus.PROCESSED
            );
        })

        const fixturesToBeProcessed = [...fixturesAdded.filter(fixture => fixture.completed).map(fixture => this.fixtureEntityMapper.toEntity(fixture, FixtureStatus.NEW)), ...fixturesNewlyCompleted];
        const fixturesToProcess = fixturesToBeProcessed.map(fixture => fixture.matchId);
        const fixturesToBeChecked = latestFixtureData.filter(fixture => !fixturesToProcess.includes(fixture.matchId));
        const fixturesToCheck = fixturesToBeChecked.map(fixture => fixture.matchId);

        this.phaseTotal = [...fixturesAdded, ...fixturesRescheduled, ...fixturesToBeProcessed].length;

        await this.execute(
            "fixtures",
            this.phaseTotal,
            this.phaseTotal > 0
                ? "Processing fixtures"
                : "No fixtures to process",
            () =>
                this.work(
                    fixturesAdded,
                    fixturesRescheduled,
                    latestFixturesById,
                    fixturesToBeProcessed
                ),
        );

        // Outputs
        return { fixturesToCheck, fixturesToProcess }
    }

    private async work(
        fixturesAdded: FixtureData[],
        fixturesRescheduled: Fixture[],
        latestFixturesById: Map<number, FixtureData>,
        fixturesToBeProcessed: Fixture[]
    ): Promise<void> {

        await this.executeStep(
            "add_fixtures",
            fixturesAdded.length,
            fixturesAdded.length > 0
                ? `Adding ${fixturesAdded.length} fixtures`
                : "No new fixtures to add",
            () => this.addFixtures(fixturesAdded),
        );

        await this.executeStep(
            "reschedule_fixtures",
            fixturesRescheduled.length,
            fixturesRescheduled.length > 0
                ? `Rescheduling ${fixturesRescheduled.length} fixtures`
                : "No fixtures to reschedule",
            () => this.rescheduleFixtures(
                fixturesRescheduled,
                latestFixturesById,
            ),
        );

        await this.executeStep(
            "mark_for_processing_fixtures",
            fixturesToBeProcessed.length,
            fixturesToBeProcessed.length > 0
                ? `Marking ${fixturesToBeProcessed.length} fixtures for processing`
                : "No fixtures to mark for processing",
            () => this.markFixturesForProcessing(
                fixturesToBeProcessed,
                latestFixturesById,
            ),
        );
    }

    private async addFixtures(
        fixturesAdded: FixtureData[],
    ): Promise<void> {
        const entities = fixturesAdded.map(fixture =>
            this.fixtureEntityMapper.toEntity(
                fixture,
                FixtureStatus.NEW
            ),
        );

        const audits = entities.map(entity =>
            this.fixtureEntityMapper.toFixtureAuditEntity(
                entity,
                "fixtureStatus",
                "",
                FixtureStatus.NEW,
            ),
        );

        await this.fixtureRepository.saveAll(entities);
        await this.fixtureAuditRepository.saveAll(audits);
    }

    private async rescheduleFixtures(
        fixturesRescheduled: Fixture[],
        latestFixturesById: Map<number, FixtureData>,
    ): Promise<void> {

        const audits: FixtureAudit[] = [];

        for (const fixture of fixturesRescheduled) {
            const latestFixture =
                latestFixturesById.get(fixture.matchId);

            if (!latestFixture) {
                continue;
            }

            const oldFixtureDate = fixture.fixtureDate;
            const newFixtureDate = new Date(latestFixture.fixtureDate);

            const oldFixtureStatus = fixture.fixtureStatus;
            const newFixtureStatus = FixtureStatus.RESCHEDULED;

            fixture.fixtureDate = newFixtureDate;
            fixture.fixtureStatus = newFixtureStatus;

            audits.push(
                this.fixtureEntityMapper.toFixtureAuditEntity(
                    fixture,
                    "fixtureDate",
                    oldFixtureDate,
                    newFixtureDate,
                ),
            );

            audits.push(
                this.fixtureEntityMapper.toFixtureAuditEntity(
                    fixture,
                    "fixtureStatus",
                    oldFixtureStatus,
                    newFixtureStatus,
                )
            );
        }

        await this.fixtureRepository.saveAll(fixturesRescheduled);

        if (audits.length > 0) {
            await this.fixtureAuditRepository.saveAll(audits);
        }
    }

    private async markFixturesForProcessing(
        fixturesToBeProcessed: Fixture[],
        latestFixturesById: Map<number, FixtureData>,
    ): Promise<void> {
        const audits: FixtureAudit[] = [];

        for (const fixture of fixturesToBeProcessed) {
            const latestFixture = latestFixturesById.get(fixture.matchId);
            if (!latestFixture) continue;

            const changedFields = this.fixtureComparator.getChangedFields(latestFixture, fixture);

            for (const { field, oldValue, newValue } of changedFields) {
                fixture[field] = newValue as never;

                audits.push(
                    this.fixtureEntityMapper.toFixtureAuditEntity(
                        fixture,
                        field,
                        oldValue,
                        newValue,
                    ),
                );
            }
        }

        for (const fixture of fixturesToBeProcessed) {
            const oldStatus = fixture.fixtureStatus;
            const newStatus = FixtureStatus.MARKED_FOR_PROCESSING;

            fixture.fixtureStatus = newStatus;

            audits.push(
                this.fixtureEntityMapper.toFixtureAuditEntity(
                    fixture,
                    "fixtureStatus",
                    oldStatus,
                    newStatus,
                ),
            );
        }
        await this.fixtureRepository.saveAll(fixturesToBeProcessed);
        await this.fixtureAuditRepository.saveAll(audits);
    }
}

