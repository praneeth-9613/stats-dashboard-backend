import { Repository } from "typeorm";
import { Team } from "../entities/Team";

export class TeamRepository {
    constructor(
        private readonly repository: Repository<Team>
    ) { }

    async findByTeamId(teamId: number): Promise<Team | null> {
        return this.repository.findOneBy({ teamId });
    }

    async save(team: Team): Promise<Team> {
        return this.repository.save(team);
    }

    async saveAll(teams: Team[]): Promise<Team[]> {
        return this.repository.save(teams);
    }
}