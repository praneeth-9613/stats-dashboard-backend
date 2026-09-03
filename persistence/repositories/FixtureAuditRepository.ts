import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";
import { FixtureAudit } from "../entities/FixtureAudit";
import { BaseAuditRepository } from "./BaseAuditRepository";
import { Repository } from "typeorm";

@injectable()
export class FixtureAuditRepository
    extends BaseAuditRepository<FixtureAudit> {

    constructor(
        @inject(TOKENS.FixtureAuditOrmRepository)
        repository: Repository<FixtureAudit>,
    ) {
        super(repository);
    }
}