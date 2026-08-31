import { Repository } from "typeorm";
import { SquadAudit } from "../entities/SquadAudit";

export class SquadAuditRepository {
    constructor(
        private readonly repository: Repository<SquadAudit>
    ) { }

    async saveAll(squadAudits: SquadAudit[]): Promise<SquadAudit[]> {
        return this.repository.save(squadAudits);
    }
}