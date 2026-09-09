import { inject, injectable } from "tsyringe";
import { Repository } from "typeorm";
import { ReserveTeam } from "../entities/ReserveTeam";
import { TOKENS } from "../../tokens";

@injectable()
export class ReserveTeamRepository {
    constructor(
        @inject(TOKENS.ReserveTeamOrmRepository)
        private readonly repository: Repository<ReserveTeam>,
    ) { }

    async findByParentTeamId(
        parentTeamId: number,
    ): Promise<ReserveTeam[]> {
        return this.repository.find({
            where: {
                parentTeamId,
            }
        });
    }

    async setReserveTeams(
        parentTeamId: number,
        reserveTeams: ReserveTeam[],
    ): Promise<ReserveTeam[]> {
        if (reserveTeams.length === 0) {
            return [];
        }

        return await this.repository.save(
            reserveTeams.map(reserveTeam => ({
                parentTeamId,
                teamId: reserveTeam.teamId,
                teamName: reserveTeam.teamName,
            })),
        );
    }
}