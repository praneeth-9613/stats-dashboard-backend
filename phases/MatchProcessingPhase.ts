import path from "path";
import { MatchResponse, MatchStatResponse } from "../api/types/RawMatch";
import { MatchMapper } from "../application/mappers/MatchMapper";
import { fetchMatch } from "../helpers/ApiHelpers";
import { getDataDirectory, saveJson } from "../helpers/DirectoryHelpers";
import { loadMatchesGoalScorers, loadMatchesPlayerStats } from "../helpers/StorageHelpers";
import { MatchComparator } from "../comparators/MatchComparator";
import { SyncPhase } from "./SyncPhase";
import { SyncContext } from "../application/types/Common";
import { MatchesGoalscorers, MatchesPlayerStats } from "../persistence/json/Matches";
import { FixtureRepository } from "../persistence/repositories/FixtureRepository";
import { FixtureStatus } from "../persistence/entities/Fixture";
import { FixtureAudit } from "../persistence/entities/FixtureAudit";
import { FixtureEntityMapper } from "../persistence/mappers/FixtureEntityMapper";
import { FixtureAuditRepository } from "../persistence/repositories/FixtureAuditRepository";
import { MatchProcessingPhaseInput } from "../application/types/PhaseInput";

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
                ? "Processing matches"
                : "No matches to process",
            () => this.work(),
        );
    }

    private async work(): Promise<void> {
        const { scrapeStatus } = this.context;

        const { fixturesToProcess } = this.matchProcessingPhaseInput;

        let index = 0;

        if (fixturesToProcess.length === 0) {
            this.updateEmptyStep("process_player_stats");
            this.updateEmptyStep("process_goalscorers");
            return;
        }

        this.startStep("process_player_stats", fixturesToProcess.length, `Processing ${fixturesToProcess.length} player stats`)
        this.startStep("process_goalscorers", fixturesToProcess.length, `Processing ${fixturesToProcess.length} goalscorers`)

        for (const matchId of fixturesToProcess) {
            const latestMatch = await fetchMatch(matchId);

            await this.processMatchPlayerStats(matchId);

            this.updateStep(
                scrapeStatus,
                "process_player_stats",
                ++index,
                `Processing player stats ${index} of ${fixturesToProcess.length}`,
            );

            await this.processMatchGoalscorers(latestMatch, matchId);

            this.updateStep(
                scrapeStatus,
                "process_player_stats",
                ++index,
                `Processing player stats ${index} of ${fixturesToProcess.length}`,
            );

            await this.markFixtureAsProcessed(matchId, latestMatch);
        }
    }

    private async processMatchPlayerStats(matchId: number): Promise<void> {
        const { season, leagueId, teamId, teamName } = this.context;

        const MATCHES_PLAYER_STATS_FILE = path.join(getDataDirectory(season, leagueId, teamId), "matches-player-stats.json");

        // API Data
        const latestMatch = await fetchMatch(matchId);
        const latestMatchData = this.matchMapper.toMatchPlayerStats(latestMatch, matchId, season, teamId);

        // Stored Data (JSON)
        const storedMatches = loadMatchesPlayerStats(season, leagueId, teamId);

        if (matchId in storedMatches) { // current match exists in stored matches
            const storedPlayerStats = storedMatches[matchId].playerStats ?? {};

            for (const [playerId, latestPlayer] of Object.entries(
                latestMatchData.playerStats ?? {},
            )) {
                if (latestPlayer.teamName !== teamName) continue; // skip opponent team's stats

                const storedPlayer = storedPlayerStats[playerId];

                if (!storedPlayer) {
                    storedPlayerStats[playerId] = latestPlayer;
                    continue;
                }

                for (const latestSection of latestPlayer.stats ?? []) {
                    const storedStatSection = storedPlayer.stats?.find(
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
            storedMatches[matchId] = latestMatchData;
        }

        saveJson<MatchesPlayerStats>(
            MATCHES_PLAYER_STATS_FILE,
            storedMatches
        );
    }

    private async processMatchGoalscorers(latestMatch: MatchResponse, matchId: number): Promise<void> {
        const { season, leagueId, teamId } = this.context;

        const MATCHES_GOALSCORERS_FILE = path.join(getDataDirectory(season, leagueId, teamId), "matches-goalscorers.json");

        // API Data
        const latestMatchData = this.matchMapper.toMatchGoalscorers(latestMatch, matchId, season, teamId);

        // Stored Data (JSON)
        const storedMatches = loadMatchesGoalScorers(season, leagueId, teamId);

        if (matchId in storedMatches) { // current match exists in stored matches
            // TODO: check for goalscorer changes
        } else {
            storedMatches[matchId] = latestMatchData;
        }

        saveJson<MatchesGoalscorers>(
            MATCHES_GOALSCORERS_FILE,
            storedMatches
        );
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