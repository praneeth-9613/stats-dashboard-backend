import { BaseAuditRepository } from "./BaseAuditRepository";
import { PlayerTeamAudit } from "../entities/PlayerTeamAudit";
import { injectable } from "tsyringe";

@injectable()
export class PlayerTeamAuditRepository
    extends BaseAuditRepository<PlayerTeamAudit> {
}