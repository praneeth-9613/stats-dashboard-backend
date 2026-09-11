import { inject, injectable } from "tsyringe";
import { LeagueSeasonTeamIdentifier } from "../application/types/PhaseInput";
import { TeamSeasonStatsRepository } from "../persistence/repositories/TeamSeasonStatsRepository";
import { TeamSeasonStats } from "../persistence/entities/TeamSeasonStats";

@injectable()
export class SeasonStatsService {

    constructor(
        @inject(TeamSeasonStatsRepository)
        private readonly teamSeasonStatsRepository: TeamSeasonStatsRepository
    ) { }

    async findSeasonStatsForLeagueSeasonTeam(
        leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier
    ): Promise<TeamSeasonStats | null> {

        const teamSeasonStats =
            await this.teamSeasonStatsRepository.findByLeagueSeasonTeam(
                leagueSeasonTeamIdentifier
            );

        return teamSeasonStats;
    }

    async saveSeasonStatsForLeagueSeasonTeam(
        teamSeasonStats: TeamSeasonStats,
    ): Promise<TeamSeasonStats | null> {
        return await this.teamSeasonStatsRepository.save(teamSeasonStats);
    }

    async findSeasonStatsForLeagueSeason(
        leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier
    ): Promise<Record<string, TeamSeasonStats>> {

        const teamSeasonStats =
            await this.teamSeasonStatsRepository.findByLeagueSeason(
                leagueSeasonTeamIdentifier
            );

        return Object.fromEntries(
            teamSeasonStats.map(stat => [String(stat.teamId), stat])
        );
    }
}