import { Repository } from "typeorm";
import { LeagueSeasonTeam } from "../entities/LeagueSeasonTeam";

export class LeagueSeasonTeamRepository {
    constructor(
        private readonly repository: Repository<LeagueSeasonTeam>
    ) { }

    async findBySeasonAndLeagueId(leagueId: number, season: string): Promise<LeagueSeasonTeam[]> {
        return this.repository.findBy({ season, leagueId });
    }

    async addTeamsToLeagueSeason(teams: LeagueSeasonTeam[]): Promise<LeagueSeasonTeam[]> {
        return this.repository.save(teams);
    }
}