import { inject, injectable } from "tsyringe";
import { PlayerMapper } from "../application/mappers/PlayerMapper";
import { PlayerRepository } from "../persistence/repositories/PlayerRepository";
import { PlayerTeamRepository } from "../persistence/repositories/PlayerTeamRepository";
import { PlayerComparator } from "../comparators/PlayerComparator";
import { SyncContext } from "../application/types/Common";
import { PlayersPhase } from "../phases/PlayersPhase";
import { PlayerPhaseInput } from "../application/types/PhaseInput";
import { PlayerEntityMapper } from "../persistence/mappers/PlayerEntityMapper";
import { PlayerAuditRepository } from "../persistence/repositories/PlayerAuditRepository";
import { PlayerTeamComparator } from "../comparators/PlayerTeamComparator";
import { PlayerTeamAuditRepository } from "../persistence/repositories/PlayerTeamAuditRepository";

@injectable()
export class PlayersPhaseFactory {
    constructor(
        @inject(PlayerMapper)
        private readonly playerMapper: PlayerMapper,
        @inject(PlayerEntityMapper)
        private readonly playerEntityMapper: PlayerEntityMapper,
        @inject(PlayerRepository)
        private readonly playerRepository: PlayerRepository,
        @inject(PlayerTeamRepository)
        private readonly playerTeamRepository: PlayerTeamRepository,
        @inject(PlayerAuditRepository)
        private readonly playerAuditRepository: PlayerAuditRepository,
        @inject(PlayerTeamAuditRepository)
        private readonly playerTeamAuditRepository: PlayerTeamAuditRepository,
        @inject(PlayerComparator)
        private readonly playerComparator: PlayerComparator,
        @inject(PlayerTeamComparator)
        private readonly playerTeamComparator: PlayerTeamComparator,
    ) { }

    create(context: SyncContext, playerPhaseInput: PlayerPhaseInput): PlayersPhase {
        return new PlayersPhase(
            context,
            playerPhaseInput,
            this.playerMapper,
            this.playerEntityMapper,
            this.playerRepository,
            this.playerTeamRepository,
            this.playerAuditRepository,
            this.playerTeamAuditRepository,
            this.playerComparator,
            this.playerTeamComparator
        );
    }
}