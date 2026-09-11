import { SeasonStatsMapper } from "../application/mappers/SeasonStatsMapper";
import { SyncPhase } from "./SyncPhase";
import { SyncContext } from "../application/types/Common";
import { MatchProcessingService } from "../service/MatchProcessingService";
import { TeamSeasonStats } from "../persistence/entities/TeamSeasonStats";
import { MatchPlayerStats } from "../persistence/entities/MatchPlayerStats";
import { TeamSeasonStatsRepository } from "../persistence/repositories/TeamSeasonStatsRepository";

export class SeasonStatsPhase extends SyncPhase<"process_team_season_stats"> {

    private phaseTotal = 0;
    protected readonly steps = [
        "process_team_season_stats",
    ] as const;

    constructor(
        protected context: SyncContext,
        private readonly seasonStatsMapper: SeasonStatsMapper,
        private readonly matchProcessingService: MatchProcessingService,
        private readonly teamSeasonStatsRepository: TeamSeasonStatsRepository
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
        teamSeasonStats.data = {};

        await this.executeStep(
            "process_team_season_stats",
            matchesPlayerStats.length,
            matchesPlayerStats.length > 0
                ? `Processing team season stats for ${matchesPlayerStats.length} matches`
                : `No matches to process season stats`,
            () => this.processTeamSeasonStats(matchesPlayerStats, teamSeasonStats)
        )

        teamSeasonStats.generatedAt = new Date().toISOString();

        await this.teamSeasonStatsRepository.save(teamSeasonStats);
    }

    async processTeamSeasonStats(matches: MatchPlayerStats[], teamSeasonStats: TeamSeasonStats) {
        for (const match of matches) {
            for (const player of Object.values(
                match.data ?? {},
            )) {
                const playerId = player.playerId;

                teamSeasonStats.data[playerId] =
                    this.seasonStatsMapper.aggregatePlayer(
                        teamSeasonStats.data[playerId],
                        player,
                    );
            }
        }
    }
}