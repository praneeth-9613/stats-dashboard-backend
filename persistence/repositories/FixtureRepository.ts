import { Repository } from "typeorm";
import { Fixture } from "../entities/Fixture";

export class FixtureRepository {
    constructor(
        private readonly repository: Repository<Fixture>
    ) { }

    async findByTeamForSeason(season: string, teamId: number): Promise<Fixture[]> {
        return this.repository.findBy({ season, teamId });
    }

    async findByMatchId(matchId: number): Promise<Fixture | null> {
        return this.repository.findOneBy({ matchId });
    }

    async save(fixture: Fixture): Promise<Fixture> {
        return this.repository.save(fixture);
    }

    async saveAll(fixtures: Fixture[]): Promise<Fixture[]> {
        return this.repository.save(fixtures);
    }
}