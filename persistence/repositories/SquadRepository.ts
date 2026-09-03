import { Repository } from "typeorm";
import { Squad } from "../entities/Squad";
import { SquadPhaseInput } from "../../application/types/PhaseInput";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";

@injectable()
export class SquadRepository {
    constructor(
         @inject(TOKENS.SquadOrmRepository)
        private readonly repository: Repository<Squad>
    ) { }

    async findByTeamForLeagueSeason({ season, leagueId, teamId }: SquadPhaseInput): Promise<Squad[]> {
        return this.repository.findBy({ season, leagueId, teamId });
    }

    async saveAll(squad: Squad[]): Promise<Squad[]> {
        return this.repository.save(squad);
    }

    async removeAll(squad: Squad[]): Promise<void> {
        if (squad.length === 0) {
            return;
        }

        await this.repository.remove(squad);
    }
}