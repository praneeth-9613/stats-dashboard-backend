import { Repository } from "typeorm";
import { PlayerTeam } from "../entities/PlayerTeam";
import { LeagueSeasonTeamIdentifier, PlayerPhaseInput } from "../../application/types/PhaseInput";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";

@injectable()
export class PlayerTeamRepository {
    constructor(
        @inject(TOKENS.PlayerTeamOrmRepository)
        private readonly repository: Repository<PlayerTeam>
    ) { }

    async findByPlayerForLeagueSeasonTeam({ leagueSeasonTeamIdentifier }: PlayerPhaseInput, playerId: number): Promise<PlayerTeam | null> {
        return this.repository.findOne({
            where: {
                season: leagueSeasonTeamIdentifier.season,
                leagueId: leagueSeasonTeamIdentifier.leagueId,
                teamId: leagueSeasonTeamIdentifier.teamId,
                playerId,
            },
            order: {
                updatedAt: "DESC",
            },
        })
    }


    async findByLeagueSeasonTeam(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): Promise<PlayerTeam[]> {
        return this.repository.find({
            where: {
                season: leagueSeasonTeamIdentifier.season,
                leagueId: leagueSeasonTeamIdentifier.leagueId,
                teamId: leagueSeasonTeamIdentifier.teamId,
            },
            relations: {
                player: true,
            },
            order: {
                updatedAt: "DESC",
            },
        })
    }

    async save(player: PlayerTeam): Promise<PlayerTeam> {
        return this.repository.save(player);
    }
}