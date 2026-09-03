import { BaseAuditRepository } from "./BaseAuditRepository";
import { PlayerTeamAudit } from "../entities/PlayerTeamAudit";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";
import { Repository } from "typeorm";

@injectable()
export class PlayerTeamAuditRepository
    extends BaseAuditRepository<PlayerTeamAudit> {

    constructor(
        @inject(TOKENS.PlayerTeamAuditOrmRepository)
        repository: Repository<PlayerTeamAudit>,
    ) {
        super(repository);
    }
}