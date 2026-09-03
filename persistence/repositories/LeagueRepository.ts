import { Repository } from "typeorm";
import { League } from "../entities/League";
import { TOKENS } from "../../tokens";
import { inject, injectable } from "tsyringe";

@injectable()
export class LeagueRepository {
    constructor(
        @inject(TOKENS.LeagueOrmRepository)
        private readonly repository: Repository<League>
    ) { }

    async ensure(
        leagueId: number,
        name: string
    ): Promise<League> {
        let entity = await this.repository.findOne({ where: { leagueId } });

        if (entity) {
            return entity;
        }

        entity = this.repository.create({
            leagueId,
            name
        });

        return this.repository.save(entity);
    }

    async findByLeagueId(leagueId: number): Promise<League | null> {
        return this.repository.findOneBy({ leagueId });
    }

    async save(league: League): Promise<League> {
        return this.repository.save(league);
    }
}