import { Repository } from "typeorm";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";
import { TeamSeasonStats } from "../entities/TeamSeasonStats";
import { LeagueSeasonTeamIdentifier } from "../../application/types/PhaseInput";

@injectable()
export class TeamSeasonStatsRepository {
    constructor(
        @inject(TOKENS.TeamSeasonStatsOrmRepository)
        private readonly repository: Repository<TeamSeasonStats>
    ) { }

    async findByLeagueSeasonTeam(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): Promise<TeamSeasonStats | null> {
        return this.repository.findOneBy({ season: leagueSeasonTeamIdentifier.season, leagueId: leagueSeasonTeamIdentifier.leagueId, teamId: leagueSeasonTeamIdentifier.teamId });
    }

    async save(teamSeasonStats: TeamSeasonStats): Promise<TeamSeasonStats | null> {
        return this.repository.save(teamSeasonStats);
    }
}