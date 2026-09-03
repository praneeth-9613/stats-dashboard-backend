import { Repository } from "typeorm";
import { PlayerTeam } from "../entities/PlayerTeam";
import { PlayerPhaseInput } from "../../application/types/PhaseInput";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";

@injectable()
export class PlayerTeamRepository {
    constructor(
        @inject(TOKENS.PlayerTeamOrmRepository)
        private readonly repository: Repository<PlayerTeam>
    ) { }

    async findByPlayerAndTeamForSeason({ season, teamId }: PlayerPhaseInput, playerId: number): Promise<PlayerTeam | null> {
        return this.repository.findOne({
            where: {
                season,
                teamId,
                playerId,
            },
            order: {
                updatedAt: "DESC",
            },
        })
    }


    async findByTeamForSeason(season: string, teamId: number): Promise<PlayerTeam[]> {
        return this.repository.find({
            where: {
                season,
                teamId,
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