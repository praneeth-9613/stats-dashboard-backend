import { inject, injectable } from "tsyringe";
import { PlayerAudit } from "../entities/PlayerAudit";
import { BaseAuditRepository } from "./BaseAuditRepository";
import { Repository } from "typeorm";
import { TOKENS } from "../../tokens";

@injectable()
export class PlayerAuditRepository
    extends BaseAuditRepository<PlayerAudit> {

    constructor(
        @inject(TOKENS.PlayerAuditOrmRepository)
        repository: Repository<PlayerAudit>,
    ) {
        super(repository);
    }

}