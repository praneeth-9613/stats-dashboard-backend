import { MatchResponse, MatchStatResponse } from "../api/types/RawMatch";
import { MatchMapper } from "../application/mappers/MatchMapper";
import { fetchMatch } from "../helpers/ApiHelpers";
import { MatchComparator } from "../comparators/MatchComparator";
import { SyncPhase } from "./SyncPhase";
import { SyncContext } from "../application/types/Common";
import { FixtureRepository } from "../persistence/repositories/FixtureRepository";
import { FixtureStatus } from "../persistence/entities/Fixture";
import { FixtureAudit } from "../persistence/entities/FixtureAudit";
import { FixtureEntityMapper } from "../persistence/mappers/FixtureEntityMapper";
import { FixtureAuditRepository } from "../persistence/repositories/FixtureAuditRepository";
import { MatchProcessingPhaseInput } from "../application/types/PhaseInput";
import { sleep } from "../helper";
import { MatchProcessingService } from "../service/MatchProcessingService";

export class MatchProcessingPhase extends SyncPhase<"process_player_stats" | "process_goalscorers"> {

    private phaseTotal = 0;
    protected readonly steps = [
        "process_player_stats",
        "process_goalscorers",
    ] as const;

    constructor(
        protected context: SyncContext,
        private readonly matchProcessingPhaseInput: MatchProcessingPhaseInput,
        private readonly matchMapper: MatchMapper,
        private readonly matchComparator: MatchComparator,
        private readonly matchProcessingService: MatchProcessingService,
        private readonly fixtureEntityMapper: FixtureEntityMapper,
        private readonly fixtureRepository: FixtureRepository,
        private readonly fixtureAuditRepository: FixtureAuditRepository
    ) {
        super(context);
    }

    async run(): Promise<void> {
        const { fixturesToProcess } = this.matchProcessingPhaseInput;

        this.phaseTotal = fixturesToProcess.length;

        await this.execute(
            "match_processing",
            this.phaseTotal,
            this.phaseTotal > 0
                ? `Processing ${this.phaseTotal} matches`
                : "No matches to process",
            () => this.work(),
        );
    }

    private async work(): Promise<void> {
        const { scrapeStatus } = this.context;

        const { fixturesToCheck, fixturesToProcess } = this.matchProcessingPhaseInput;

        const fixturesToUpdate = []

        for (const fixture of fixturesToCheck) {
            const latestMatch = await fetchMatch(fixture);
            const stadium = latestMatch.content?.matchFacts?.infoBox?.Stadium;


            const storedFixture = await this.fixtureRepository.findByMatchId(fixture);

            if (storedFixture !== null && (stadium?.name !== storedFixture?.stadiumName || stadium?.city !== storedFixture?.stadiumCity || stadium?.country !== storedFixture?.stadiumCountry)) {
                storedFixture.stadiumName = stadium?.name ?? null;
                storedFixture.stadiumCity = stadium?.city ?? null;
                storedFixture.stadiumCountry = stadium?.country ?? null;

                fixturesToUpdate.push(storedFixture);
            }
        }

        if (fixturesToUpdate.length > 0) {
            await this.fixtureRepository.saveAll(fixturesToUpdate);
        }

        let statsIndex = 0;
        let goalscorersIndex = 0;

        if (fixturesToProcess.length === 0) {
            this.updateEmptyStep("process_player_stats");
            this.updateEmptyStep("process_goalscorers");

            await sleep(1500);
            return;
        }

        this.context.logger?.info(`Starting step process_player_stats `);
        this.startStep("process_player_stats", fixturesToProcess.length, `Processing ${fixturesToProcess.length} player stats`)

        this.context.logger?.info(`Starting step process_goalscorers `);
        this.startStep("process_goalscorers", fixturesToProcess.length, `Processing ${fixturesToProcess.length} goalscorers`)

        for (const matchId of fixturesToProcess) {
            const latestMatch = await fetchMatch(matchId);

            await this.processMatchPlayerStats(matchId);

            this.updateStep(
                scrapeStatus,
                "process_player_stats",
                ++statsIndex,
                `Processing player stats ${statsIndex} of ${fixturesToProcess.length}`,
            );

            await this.processMatchGoalscorers(latestMatch, matchId);

            this.updateStep(
                scrapeStatus,
                "process_goalscorers",
                ++goalscorersIndex,
                `Processing goal scorers ${goalscorersIndex} of ${fixturesToProcess.length}`,
            );

            await this.markFixtureAsProcessed(matchId, latestMatch);
        }

        this.context.logger?.info(`Completing step process_player_stats `);
        this.context.logger?.info(`Completing step process_goalscorers `);
    }

    private async processMatchPlayerStats(matchId: number): Promise<void> {
        const { leagueSeasonTeamIdentifier } = this.context;

        // API Data
        const latestMatch = await fetchMatch(matchId);
        const latestMatchData = this.matchMapper.toMatchPlayerStats(latestMatch, matchId, leagueSeasonTeamIdentifier);

        // Stored Data (JSON)
        const storedMatches = await this.matchProcessingService.findMatchPlayerStatsForLeagueSeasonTeam(leagueSeasonTeamIdentifier);

        if (matchId in storedMatches) { // current match exists in stored matches
            const storedPlayerStats = storedMatches[matchId].data ?? {};

            for (const [playerId, latestPlayer] of Object.entries(
                latestMatchData.playerStats ?? {},
            )) {
                const storedPlayer = storedPlayerStats[playerId];

                if (!storedPlayer) {
                    storedPlayerStats[playerId] = latestPlayer;
                    continue;
                }

                for (const latestSection of latestPlayer.stats ?? []) {
                    const storedStatSection = storedPlayer?.stats?.find(
                        section => section.key === latestSection.key,
                    );

                    if (!storedStatSection) {
                        // New section
                        storedPlayer.stats ??= [];
                        storedPlayer.stats.push(latestSection);
                        continue;
                    }

                    for (const [statName, latestWrapper] of Object.entries(
                        latestSection.stats,
                    )) {
                        const storedWrapper =
                            storedStatSection.stats[statName];

                        if (!storedWrapper) {
                            storedStatSection.stats[statName] = latestWrapper;
                            continue;
                        }

                        const changedFields =
                            this.matchComparator.getChangedFields(
                                latestWrapper,
                                storedWrapper,
                            );

                        for (const { newValue } of changedFields) {
                            storedStatSection.stats[statName] = {
                                ...storedWrapper,
                                stat: newValue as MatchStatResponse,
                            };
                        }
                    }
                }
            }
        } else {
            storedMatches[matchId] = {
                season: leagueSeasonTeamIdentifier.season,
                leagueId: leagueSeasonTeamIdentifier.leagueId,
                teamId: leagueSeasonTeamIdentifier.teamId ?? 0,
                matchId: matchId,
                data: latestMatchData.playerStats ?? null
            }
        }

        await this.matchProcessingService.saveMatchPlayerStatsForLeagueSeasonTeam(storedMatches);
    }

    private async processMatchGoalscorers(latestMatch: MatchResponse, matchId: number): Promise<void> {
        const { leagueSeasonTeamIdentifier } = this.context;

        // API Data
        const latestMatchData = this.matchMapper.toMatchGoalscorers(latestMatch, matchId, leagueSeasonTeamIdentifier);

        // Stored Data (JSON)
        const storedMatches = await this.matchProcessingService.findMatchGoalscorersForLeagueSeasonTeam(leagueSeasonTeamIdentifier);

        if (matchId in storedMatches) { // current match exists in stored matches
            // TODO: check for goalscorer changes
        } else {
            storedMatches[matchId] = {
                season: leagueSeasonTeamIdentifier.season,
                leagueId: leagueSeasonTeamIdentifier.leagueId,
                teamId: leagueSeasonTeamIdentifier.teamId ?? 0,
                matchId: matchId,
                data: latestMatchData?.goalscorers ?? null,
                potm: latestMatchData.playerOfTheMatch ?? null
            }
        }

        await this.matchProcessingService.saveMatchGoalscorersForLeagueSeasonTeam(storedMatches);
    }

    private async markFixtureAsProcessed(matchId: number, latestMatch: MatchResponse) {
        const fixture = await this.fixtureRepository.findByMatchId(matchId);

        if (fixture !== null) {

            const oldStatus = fixture.fixtureStatus;
            const newStatus = FixtureStatus.PROCESSED;

            fixture.fixtureStatus = newStatus;

            const audit: FixtureAudit =
                this.fixtureEntityMapper.toFixtureAuditEntity(
                    fixture,
                    "fixtureStatus",
                    oldStatus,
                    newStatus,
                )

            const stadium = latestMatch.content?.matchFacts?.infoBox?.Stadium;

            fixture.stadiumName = stadium?.name ?? null;
            fixture.stadiumCity = stadium?.city ?? null;
            fixture.stadiumCountry = stadium?.country ?? null;

            await this.fixtureRepository.save(fixture);
            await this.fixtureAuditRepository.save(audit)
        }
    }
}