import path from "node:path";
import { SeasonStatsMapper } from "../application/mappers/SeasonStatsMapper";
import { getDataDirectory, saveJson } from "../helpers/DirectoryHelpers";
import { loadMatchesPlayerStats } from "../helpers/StorageHelpers";
import { SeasonStats } from "../persistence/json/SeasonStats";
import { SyncPhase } from "./SyncPhase";
import { SyncContext } from "../application/types/Common";
import { MatchesPlayerStats, MatchPlayerStats } from "../persistence/json/Matches";

export class SeasonStatsPhase extends SyncPhase<"process_team_season_stats" | "process_league_season_stats"> {

    private phaseTotal = 0;
    protected readonly steps = [
        "process_team_season_stats",
        "process_league_season_stats",
    ] as const;

    constructor(
        protected context: SyncContext,
        private readonly seasonStatsMapper: SeasonStatsMapper,
    ) {
        super(context);
    }

    async run(): Promise<void> {
        const {
            leagueSeasonTeamIdentifier
        } = this.context;

        const matchPlayerStats =
            loadMatchesPlayerStats(
                leagueSeasonTeamIdentifier
            );

        this.phaseTotal = Object.values(matchPlayerStats).length;

        await this.execute(
            "season_stats",
            this.phaseTotal,
            this.phaseTotal > 0 ?
                `Processing season stats for ${this.phaseTotal} matches` : `No matches to process for given team and league season`,
            () => this.work(matchPlayerStats),
        );
    }

    private async work(matchPlayerStats: MatchesPlayerStats): Promise<void> {
        const {
            leagueSeasonTeamIdentifier,
            teamName,
        } = this.context;

        const SEASON_STATS_FILE = path.join(getDataDirectory(leagueSeasonTeamIdentifier), "season-stats.json");

        const seasonStats: SeasonStats = {
            team: teamName,
            leagueSeasonTeamIdentifier,
            matchesProcessed: this.phaseTotal,
            players: {},
        };

        const matches = Object.values(matchPlayerStats);

        await this.executeStep(
            "process_team_season_stats",
            matches.length,
            matches.length > 0
                ? `Processing team season stats for ${matches.length} matches`
                : `No matches to process season stats`,
            () => this.processTeamSeasonStats(matches, seasonStats)
        )

        seasonStats.generatedAt = new Date().toISOString();

        saveJson<SeasonStats>(
            SEASON_STATS_FILE,
            seasonStats
        );
    }

    async processTeamSeasonStats(matches: MatchPlayerStats[], seasonStats: SeasonStats) {
        for (const match of matches) {
            for (const player of Object.values(
                match.playerStats ?? {},
            )) {
                const playerId = player.playerId;

                seasonStats.players[playerId] =
                    this.seasonStatsMapper.aggregatePlayer(
                        seasonStats.players[playerId],
                        player,
                    );
            }
        }
    }
}