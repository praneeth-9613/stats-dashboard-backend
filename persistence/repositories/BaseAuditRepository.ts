import { Repository } from "typeorm";
import { BaseAudit } from "../../BaseAudit";

export abstract class BaseAuditRepository<T extends BaseAudit> {
    constructor(
        protected readonly repository: Repository<T>,
    ) { }

    async save(audit: T): Promise<T> {
        return this.repository.save(audit);
    }

    async saveAll(audits: T[]): Promise<T[]> {
        return this.repository.save(audits);
    }
}