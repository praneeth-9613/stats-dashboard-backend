import { SeasonStatsMapper } from "../application/mappers/SeasonStatsMapper";
import { SyncPhase } from "./SyncPhase";
import { SyncContext } from "../application/types/Common";
import { MatchProcessingService } from "../service/MatchProcessingService";
import { TeamSeasonStats } from "../persistence/entities/TeamSeasonStats";
import { MatchPlayerStats } from "../persistence/entities/MatchPlayerStats";
import { SeasonStatsService } from "../service/SeasonStatsService";
import { CLUB_FRIENDLY_COMPETITION_ID } from "../constants";
import { SeasonPlayerStats } from "../application/types/SeasonStats";

export class SeasonStatsPhase extends SyncPhase<"process_team_season_stats"> {

    private phaseTotal = 0;
    protected readonly steps = [
        "process_team_season_stats",
    ] as const;

    constructor(
        protected context: SyncContext,
        private readonly seasonStatsMapper: SeasonStatsMapper,
        private readonly matchProcessingService: MatchProcessingService,
        private readonly seasonStatsService: SeasonStatsService
    ) {
        super(context);
    }

    async run(): Promise<void> {
        const {
            leagueSeasonTeamIdentifier
        } = this.context;

        const matchPlayerStatsByMatchId = await
            this.matchProcessingService.findMatchPlayerStatsForLeagueSeasonTeam(
                leagueSeasonTeamIdentifier
            );

        const matchesPlayerStats = Object.values(matchPlayerStatsByMatchId);

        this.phaseTotal = matchesPlayerStats.length;

        await this.execute(
            "season_stats",
            this.phaseTotal,
            this.phaseTotal > 0 ?
                `Processing season stats for ${this.phaseTotal} matches` : `No matches to process for given team and league season`,
            () => this.work(matchesPlayerStats),
        );
    }

    private async work(matchesPlayerStats: MatchPlayerStats[]): Promise<void> {
        const {
            leagueSeasonTeamIdentifier,
        } = this.context;

        const teamSeasonStats: TeamSeasonStats = new TeamSeasonStats();

        teamSeasonStats.season = leagueSeasonTeamIdentifier.season;
        teamSeasonStats.leagueId = leagueSeasonTeamIdentifier.leagueId;
        teamSeasonStats.teamId = leagueSeasonTeamIdentifier.teamId ?? 0;
        teamSeasonStats.matchesProcessed = this.phaseTotal;
        teamSeasonStats.competitiveMatchesProcessed = 0;
        teamSeasonStats.leagueMatchesProcessed = 0;
        teamSeasonStats.data = { domestic_league: {}, competitive: {}, all: {} };

        await this.executeStep(
            "process_team_season_stats",
            matchesPlayerStats.length,
            matchesPlayerStats.length > 0
                ? `Processing team season stats for ${matchesPlayerStats.length} matches`
                : `No matches to process season stats`,
            () => this.processTeamSeasonStats(matchesPlayerStats, teamSeasonStats)
        )

        teamSeasonStats.generatedAt = new Date().toISOString();

        await this.seasonStatsService.saveSeasonStatsForLeagueSeasonTeam(teamSeasonStats);
    }

    async processTeamSeasonStats(matches: MatchPlayerStats[], teamSeasonStats: TeamSeasonStats) {
        for (const match of matches) {
            for (const player of Object.values(
                match.data ?? {},
            )) {
                const playerKey = `${player.playerId}-${teamSeasonStats.teamId}`;

                const aggregate = (
                    stats: Record<string, SeasonPlayerStats>,
                ) => {
                    stats[playerKey] = this.seasonStatsMapper.aggregatePlayer(
                        stats[playerKey],
                        player,
                    );
                };

                // All matches
                aggregate(teamSeasonStats.data.all);

                // Competitive matches (everything except friendlies)
                if (match.competitionId !== CLUB_FRIENDLY_COMPETITION_ID) {
                    aggregate(teamSeasonStats.data.competitive);

                    if (
                        teamSeasonStats.competitiveMatchesProcessed === null) {
                        teamSeasonStats.competitiveMatchesProcessed = 1
                    } else {
                        teamSeasonStats.competitiveMatchesProcessed++
                    }
                }

                // Domestic league matches
                if (match.competitionId === teamSeasonStats.leagueId) {
                    aggregate(teamSeasonStats.data.domestic_league);

                    if (
                        teamSeasonStats.leagueMatchesProcessed === null) {
                        teamSeasonStats.leagueMatchesProcessed = 1
                    } else {
                        teamSeasonStats.leagueMatchesProcessed++
                    }
                }
            }
        }
    }
}