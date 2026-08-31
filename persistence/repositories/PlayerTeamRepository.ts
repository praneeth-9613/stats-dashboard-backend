import { Repository } from "typeorm";
import { Player } from "../entities/Player";
import { PlayerTeam } from "../entities/PlayerTeam";
import { PlayerPhaseInput } from "../../application/types/PhaseInput";

export class PlayerTeamRepository {
    constructor(
        private readonly repository: Repository<PlayerTeam>
    ) { }

    async findByTeamForSeason({ season, teamId }: PlayerPhaseInput, playerId: number): Promise<PlayerTeam | null> {
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

    async save(player: PlayerTeam): Promise<PlayerTeam> {
        return this.repository.save(player);
    }
}