import { In, Repository } from "typeorm";
import { Player } from "../entities/Player";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";

@injectable()
export class PlayerRepository {
    constructor(
        @inject(TOKENS.PlayerOrmRepository)
        private readonly repository: Repository<Player>
    ) { }

    async findByPlayerId(playerId: number): Promise<Player | null> {
        return this.repository.findOneBy({ playerId });
    }

    async findByPlayerIds(playerIds: number[]): Promise<Player[]> {
        return this.repository.findBy({
            playerId: In(playerIds),
        });
    }

    async save(player: Player): Promise<Player> {
        return this.repository.save(player);
    }
}