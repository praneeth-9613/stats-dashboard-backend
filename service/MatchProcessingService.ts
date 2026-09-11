import { inject, injectable } from "tsyringe";
import { LeagueSeasonTeamIdentifier } from "../application/types/PhaseInput";
import { MatchPlayerStatsRepository } from "../persistence/repositories/MatchPlayerStatsRepository";
import { MatchPlayerStats } from "../persistence/entities/MatchPlayerStats";
import { MatchGoalscorers } from "../persistence/entities/MatchGoalscorers";
import { MatchGoalscorersRepository } from "../persistence/repositories/MatchGoalscorersRepository";

@injectable()
export class MatchProcessingService {

    constructor(
        @inject(MatchPlayerStatsRepository)
        private readonly matchPlayerStatsRepository: MatchPlayerStatsRepository,

        @inject(MatchGoalscorersRepository)
        private readonly matchGoalscorersRepository: MatchGoalscorersRepository
    ) { }

    async findMatchPlayerStatsForLeagueSeasonTeam(
        leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier
    ): Promise<Record<string, MatchPlayerStats>> {

        const matchPlayerStats =
            await this.matchPlayerStatsRepository.findByLeagueSeasonTeam(
                leagueSeasonTeamIdentifier
            );

        return Object.fromEntries(
            matchPlayerStats.map(stat => [String(stat.matchId), stat])
        );
    }

    async saveMatchPlayerStatsForLeagueSeasonTeam(
        matchPlayerStatsByMatchId: Record<string, MatchPlayerStats>,
    ): Promise<MatchPlayerStats[]> {

        const matchPlayerStats = Object.values(matchPlayerStatsByMatchId);

        return await this.matchPlayerStatsRepository.saveAll(matchPlayerStats);
    }

    async findMatchGoalscorersForLeagueSeasonTeam(
        leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier
    ): Promise<Record<string, MatchGoalscorers>> {

        const matchGoalscorers =
            await this.matchGoalscorersRepository.findByLeagueSeasonTeam(
                leagueSeasonTeamIdentifier
            );

        return Object.fromEntries(
            matchGoalscorers.map(goalscorer => [String(goalscorer.matchId), goalscorer])
        );
    }

    async saveMatchGoalscorersForLeagueSeasonTeam(
        matchGoalscorersByMatchId: Record<string, MatchGoalscorers>,
    ): Promise<MatchGoalscorers[]> {

        const matchGoalscorers = Object.values(matchGoalscorersByMatchId);

        return await this.matchGoalscorersRepository.saveAll(matchGoalscorers);
    }
}