import { inject, injectable } from "tsyringe";
import { SyncContext } from "../application/types/Common";
import { SquadMapper } from "../application/mappers/SquadMapper";
import { SquadsPhase } from "../phases/SquadsPhase";
import { TeamResponse } from "../api/types/RawTeam";
import { PlayerTeamRepository } from "../persistence/repositories/PlayerTeamRepository";

@injectable()
export class SquadPhaseFactory {
    constructor(
        @inject(SquadMapper)
        private readonly squadMapper: SquadMapper,
        @inject(PlayerTeamRepository)
        private readonly playerTeamRepository: PlayerTeamRepository,
    ) { }

    create(context: SyncContext, teamInfo: TeamResponse): SquadsPhase {
        return new SquadsPhase(
            context,
            teamInfo,
            this.squadMapper,
            this.playerTeamRepository
        );
    }
}