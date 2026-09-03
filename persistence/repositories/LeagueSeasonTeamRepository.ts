import { Repository } from "typeorm";
import { LeagueSeasonTeam } from "../entities/LeagueSeasonTeam";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";

@injectable()
export class LeagueSeasonTeamRepository {
    constructor(
        @inject(TOKENS.LeagueSeasonTeamOrmRepository)
        private readonly repository: Repository<LeagueSeasonTeam>
    ) { }

    async findBySeasonAndLeagueId(leagueId: number, season: string): Promise<LeagueSeasonTeam[]> {
        return this.repository.findBy({ season, leagueId });
    }

    async saveAll(teams: LeagueSeasonTeam[]): Promise<LeagueSeasonTeam[]> {
        return this.repository.save(teams);
    }
}