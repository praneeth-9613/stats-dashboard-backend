import { Repository } from "typeorm";
import { LeagueSeasonTeamIdentifier } from "../../application/types/PhaseInput";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";
import { MatchGoalscorers } from "../entities/MatchGoalscorers";

@injectable()
export class MatchGoalscorersRepository {
    constructor(
        @inject(TOKENS.MatchGoalscorersOrmRepository)
        private readonly repository: Repository<MatchGoalscorers>
    ) { }

    async findByLeagueSeasonTeam(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): Promise<MatchGoalscorers[]> {
        return this.repository.findBy({ season: leagueSeasonTeamIdentifier.season, leagueId: leagueSeasonTeamIdentifier.leagueId, teamId: leagueSeasonTeamIdentifier.teamId });
    }

    async findByMatchId(matchId: number): Promise<MatchGoalscorers | null> {
        return this.repository.findOneBy({ matchId });
    }

    async save(matchGoalscorers: MatchGoalscorers): Promise<MatchGoalscorers> {
        return this.repository.save(matchGoalscorers);
    }

    async saveAll(matchGoalscorers: MatchGoalscorers[]): Promise<MatchGoalscorers[]> {
        return this.repository.save(matchGoalscorers);
    }
}