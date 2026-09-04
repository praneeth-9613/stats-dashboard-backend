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
        return this.repository.find({
            where: {
                season,
                leagueId,
            },
            relations: {
                team: true,
            },
            order: {
                team: {
                    name: "ASC",
                },
            },
        });
    }

    async saveAll(teams: LeagueSeasonTeam[]): Promise<LeagueSeasonTeam[]> {
        return this.repository.save(teams);
    }
}