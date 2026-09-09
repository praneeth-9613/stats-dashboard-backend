import { Repository } from "typeorm";
import { Team } from "../entities/Team";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";

@injectable()
export class TeamRepository {
    constructor(
        @inject(TOKENS.TeamOrmRepository)
        private readonly repository: Repository<Team>
    ) { }

    async findByTeamId(teamId: number): Promise<Team | null> {
        return this.repository.findOne({
            where: {
                teamId,
            },
            relations: {
                reserveTeams: true,
            },
        });
    }

    async save(team: Team): Promise<Team> {
        return this.repository.save(team);
    }

    async saveAll(teams: Team[]): Promise<Team[]> {
        return this.repository.save(teams);
    }


    async updateTeam(
        teamId: number,
        primaryColor?: string | null,
        secondaryColor?: string | null,
    ): Promise<Team | null> {
        const team = await this.findByTeamId(teamId);

        if (!team) {
            return null;
        }

        if (primaryColor !== undefined) {
            team.primaryColor = primaryColor;
        }

        if (secondaryColor !== undefined) {
            team.secondaryColor = secondaryColor;
        }

        return this.repository.save(team);
    }
}