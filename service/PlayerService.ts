import { inject, injectable } from "tsyringe";
import { PlayerTeam } from "../persistence/entities/PlayerTeam";
import { PlayerRepository } from "../persistence/repositories/PlayerRepository";
import { PlayerTeamRepository } from "../persistence/repositories/PlayerTeamRepository";
import { LeagueSeasonTeamIdentifier } from "../application/types/PhaseInput";

@injectable()
export class PlayerService {

    constructor(
        @inject(PlayerTeamRepository)
        private readonly playerTeamRepository: PlayerTeamRepository) { }

    async findPlayersForTeamSeason(
        leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier
    ): Promise<Record<string, PlayerTeam>> {

        const playerTeams =
            await this.playerTeamRepository.findByLeagueSeasonTeam(
                leagueSeasonTeamIdentifier
            );

        return Object.fromEntries(
            playerTeams.map(playerTeam => [
                String(playerTeam.playerId),
                playerTeam,
            ]),
        );;
    }
}