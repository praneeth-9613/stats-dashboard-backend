import { Repository } from "typeorm";
import { Player } from "../entities/Player";

export class PlayerRepository {
    constructor(
        private readonly repository: Repository<Player>
    ) { }

    async findByPlayerId(playerId: number): Promise<Player | null> {
        return this.repository.findOneBy({ playerId });
    }

    async save(player: Player): Promise<Player> {
        return this.repository.save(player);
    }
}