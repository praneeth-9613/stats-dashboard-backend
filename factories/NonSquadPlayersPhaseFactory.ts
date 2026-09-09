import { inject, injectable } from "tsyringe";
import { PlayerMapper } from "../application/mappers/PlayerMapper";
import { PlayerEntityMapper } from "../persistence/mappers/PlayerEntityMapper";
import { PlayerRepository } from "../persistence/repositories/PlayerRepository";
import { PlayerTeamRepository } from "../persistence/repositories/PlayerTeamRepository";
import { ReserveTeamRepository } from "../persistence/repositories/ReserveTeamRepository";
import { SyncContext } from "../application/types/Common";
import { NonSquadPlayersPhase } from "../phases/NonSquadPlayersPhase";

@injectable()
export class NonSquadPlayersPhaseFactory {
    constructor(
        @inject(PlayerMapper)
        private readonly playerMapper: PlayerMapper,
        @inject(PlayerEntityMapper)
        private readonly playerEntityMapper: PlayerEntityMapper,
        @inject(PlayerRepository)
        private readonly playerRepository: PlayerRepository,
        @inject(PlayerTeamRepository)
        private readonly playerTeamRepository: PlayerTeamRepository,
        @inject(ReserveTeamRepository)
        private readonly reserveTeamRepository: ReserveTeamRepository
    ) { }

    create(context: SyncContext): NonSquadPlayersPhase {
        return new NonSquadPlayersPhase(
            context,
            this.playerMapper,
            this.playerEntityMapper,
            this.playerRepository,
            this.playerTeamRepository,
            this.reserveTeamRepository
        );
    }
}