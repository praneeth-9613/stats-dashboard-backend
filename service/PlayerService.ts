import { Player } from "../persistence/entities/Player";
import { PlayerTeam } from "../persistence/entities/PlayerTeam";
import { PlayerRepository } from "../persistence/repositories/PlayerRepository";
import { PlayerTeamRepository } from "../persistence/repositories/PlayerTeamRepository";

export class PlayerService {

    constructor(private readonly playerTeamRepository: PlayerTeamRepository, private readonly playerRepository: PlayerRepository) { }

    async findPlayersForTeamSeason(
        teamId: number,
        season: string,
    ): Promise<{ player: Player; playerTeam: PlayerTeam }[]> {
        const playerTeams =
            await this.playerTeamRepository.findByTeamForSeason(
                season,
                teamId
            );

        const playerIds = playerTeams.map(
            playerTeam => playerTeam.playerId,
        );

        const players =
            await this.playerRepository.findByPlayerIds(playerIds);

        const playersById = new Map(
            players.map(player => [player.playerId, player]),
        );

        return playerTeams
            .map(playerTeam => {
                const player = playersById.get(playerTeam.playerId);

                if (!player) {
                    return null;
                }

                return {
                    player,
                    playerTeam,
                };
            })
            .filter(
                (
                    item,
                ): item is {
                    player: Player;
                    playerTeam: PlayerTeam;
                } => item !== null,
            );
    }
}