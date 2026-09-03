import { Repository } from "typeorm";
import { SquadAudit } from "../entities/SquadAudit";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";

@injectable()
export class SquadAuditRepository {
    constructor(
        @inject(TOKENS.SquadAuditOrmRepository)
        private readonly repository: Repository<SquadAudit>
    ) { }

    async saveAll(squadAudits: SquadAudit[]): Promise<SquadAudit[]> {
        return this.repository.save(squadAudits);
    }
}