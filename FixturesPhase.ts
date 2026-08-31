import { SyncPhase } from "./SyncPhase";
import { TeamResponse } from "./api/types/RawTeam";
import { SyncContext } from "./types/Common";
import { fetchFixtures } from "./helpers/ApiHelpers";
import { FixtureRepository } from "./persistence/repositories/FixtureRepository";
import { FixtureMapper } from "./application/mappers/FixtureMapper";
import { FixtureData } from "./application/types/FixtureData";
import { updateProgress } from "./helper";
import { Fixture } from "./persistence/entities/Fixture";
import { FixtureAuditAction } from "./persistence/entities/FixtureAudit";
import { FixturesPhaseOutput } from "./application/types/PhaseOutput";
import { FixtureEntityMapper } from "./persistence/mappers/FixtureEntityMapper";
import { FixtureAuditRepository } from "./persistence/repositories/FixtureAuditRepository";

export class FixturesPhase extends SyncPhase {

    private phaseTotal = 0;

    constructor(protected context: SyncContext, private readonly teamResponse: TeamResponse, private readonly fixtureMapper: FixtureMapper, private readonly fixtureEntityMapper: FixtureEntityMapper, private readonly fixtureRepository: FixtureRepository, private readonly fixtureAuditRepository: FixtureAuditRepository) { super(context); }

    async run(teamInfo: TeamResponse): Promise<FixturesPhaseOutput> {
        const {
            teamId,
            season,
            refresh,
            scrapeStatus
        } = this.context;

        // API Data
        const latestFixtures = await fetchFixtures(this.teamResponse);

        const latestFixtureData = this.fixtureMapper.toFixtureData(latestFixtures, season, teamId);

        // DB Data
        const storedFixtures = await this.fixtureRepository.findByTeamForSeason(season, teamId);

        // Discover new / rescheduled fixtures
        const latestFixturesById = new Map(
            latestFixtureData.map(fixture => [fixture.matchId, fixture]),
        );
        const storedFixtureIds = new Set(
            storedFixtures.map(fixture => fixture.matchId)
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

        const fixturesToProcess = fixturesAdded.filter(fixture => fixture.completed).map(fixture => fixture.matchId);

        this.phaseTotal = [...fixturesAdded, ...fixturesRescheduled].length;

        await this.execute(
            "fixtures",
            this.phaseTotal,
            this.phaseTotal > 0
                ? "Processing fixtures"
                : "No fixtues to process",
            () =>
                this.work(
                    fixturesAdded,
                    fixturesRescheduled,
                ),
        );

        // Outputs
        return { fixturesToProcess }
    }

    private async work(
        fixturesAdded: FixtureData[],
        fixturesRescheduled: Fixture[],
    ): Promise<void> {
        const { scrapeStatus } = this.context;

        if (fixturesAdded.length > 0) {
            await this.addFixtures(
                fixturesAdded,
            );
        }

        if (fixturesRescheduled.length > 0) {
            await this.updateFixtures(
                fixturesRescheduled,
            );
        }

        updateProgress(
            scrapeStatus,
            this.phaseTotal,
            `Processed ${this.phaseTotal} fixtures)`,
        );
    }

    private async addFixtures(
        fixturesAdded: FixtureData[],
    ): Promise<void> {
        const entities = fixturesAdded.map(fixture =>
            this.fixtureEntityMapper.toEntity(
                fixture
            ),
        );

        const audits = entities.map(entity =>
            this.fixtureEntityMapper.toFixtureAuditEntity(
                entity,
                FixtureAuditAction.NEW,
            ),
        );

        await this.fixtureRepository.saveAll(entities);
        await this.fixtureAuditRepository.saveAll(audits);
    }

    private async updateFixtures(
        fixturesRescheduled: Fixture[],
    ): Promise<void> {
        const entities = fixturesRescheduled;

        const audits = entities.map(entity =>
            this.fixtureEntityMapper.toFixtureAuditEntity(
                entity,
                FixtureAuditAction.MARKED_FOR_PROCESSING,
            ),
        );

        await this.fixtureRepository.saveAll(entities);
        await this.fixtureAuditRepository.saveAll(audits);
    }
}

