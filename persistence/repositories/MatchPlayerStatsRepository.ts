import { Repository } from "typeorm";
import { LeagueSeasonTeamIdentifier } from "../../application/types/PhaseInput";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";
import { MatchPlayerStats } from "../entities/MatchPlayerStats";

@injectable()
export class MatchPlayerStatsRepository {
    constructor(
        @inject(TOKENS.MatchPlayerStatsOrmRepository)
        private readonly repository: Repository<MatchPlayerStats>
    ) { }

    async findByLeagueSeasonTeam(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): Promise<MatchPlayerStats[]> {
        return this.repository.findBy({ season: leagueSeasonTeamIdentifier.season, leagueId: leagueSeasonTeamIdentifier.leagueId, teamId: leagueSeasonTeamIdentifier.teamId });
    }

    async findByMatchId(matchId: number): Promise<MatchPlayerStats | null> {
        return this.repository.findOneBy({ matchId });
    }

    async save(matchPlayerStats: MatchPlayerStats): Promise<MatchPlayerStats> {
        return this.repository.save(matchPlayerStats);
    }

    async saveAll(matchPlayerStats: MatchPlayerStats[]): Promise<MatchPlayerStats[]> {
        return this.repository.save(matchPlayerStats);
    }
}