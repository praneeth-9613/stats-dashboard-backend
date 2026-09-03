import { inject, injectable } from "tsyringe";
import { SyncContext } from "../application/types/Common";
import { SquadMapper } from "../application/mappers/SquadMapper";
import { SquadEntityMapper } from "../persistence/mappers/SquadEntityMapper";
import { SquadRepository } from "../persistence/repositories/SquadRepository";
import { SquadAuditRepository } from "../persistence/repositories/SquadAuditRepository";
import { SquadsPhase } from "../phases/SquadsPhase";
import { TeamResponse } from "../api/types/RawTeam";

@injectable()
export class SquadPhaseFactory {
    constructor(
        @inject(SquadMapper)
        private readonly squadMapper: SquadMapper,
        @inject(SquadEntityMapper)
        private readonly squadEntityMapper: SquadEntityMapper,
        @inject(SquadRepository)
        private readonly squadRepository: SquadRepository,
        @inject(SquadAuditRepository)
        private readonly squadAuditRepository: SquadAuditRepository,
    ) { }

    create(context: SyncContext, teamInfo: TeamResponse): SquadsPhase {
        return new SquadsPhase(
            context,
            teamInfo,
            this.squadMapper,
            this.squadEntityMapper,
            this.squadRepository,
            this.squadAuditRepository,
        );
    }
}