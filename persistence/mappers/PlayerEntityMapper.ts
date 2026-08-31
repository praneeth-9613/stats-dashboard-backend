import { PlayerPhaseInput } from "../../application/types/PhaseInput";
import { PlayerInjuryInformation, PlayerPositionData, PlayerProfile, PlayerTeamData } from "../../application/types/PlayerData";
import { Player } from "../entities/Player";
import { PlayerAudit } from "../entities/PlayerAudit";
import { PlayerTeam, TeamStatus } from "../entities/PlayerTeam";
import { PlayerTeamAudit } from "../entities/PlayerTeamAudit";

export class PlayerEntityMapper {
    toPlayerEntity(playerProfile: PlayerProfile, positions: PlayerPositionData[], injury: PlayerInjuryInformation | null): Player {
        const player = new Player();

        player.playerId = playerProfile.id;
        player.age = Number(playerProfile.age);
        player.height = playerProfile.height ?? "";
        player.country = playerProfile.country ?? "";
        player.transferValue = playerProfile.transfer_value ?? "";
        player.preferredFoot = playerProfile.preferred_foot ?? "Both";
        player.positions = positions;
        player.injury = injury;

        return player;
    }

    toPlayerTeamEntity(playerId: number, playerTeamData: PlayerTeamData): PlayerTeam {
        const playerTeam = new PlayerTeam();

        playerTeam.playerId = playerId;
        playerTeam.teamId = playerTeamData.teamId;
        playerTeam.shirtNumber = playerTeamData.shirt ?? null;
        playerTeam.teamStatus = playerTeamData.teamStatus ?? TeamStatus.UNKNOWN;
        playerTeam.isCaptain = playerTeamData.isCaptain;

        return playerTeam;
    }

    toPlayerAuditEntity(playerId: number, field: keyof Player, oldValue: any , newValue: any) : PlayerAudit{
        const playerAudit = new PlayerAudit();

        playerAudit.playerId = playerId;
        playerAudit.field = field;
        playerAudit.oldValue = oldValue;
        playerAudit.newValue = newValue;

        return playerAudit;
    }

    toPlayerTeamAuditEntity(playerPhaseInput: PlayerPhaseInput, playerId: number, field: keyof PlayerTeam, oldValue: any , newValue: any) : PlayerTeamAudit{
        const playerTeamAudit = new PlayerTeamAudit();

        playerTeamAudit.playerId = playerId;
        playerTeamAudit.teamId = playerPhaseInput.teamId;
        playerTeamAudit.season = playerPhaseInput.season;
        playerTeamAudit.field = field;
        playerTeamAudit.oldValue = oldValue;
        playerTeamAudit.newValue = newValue;

        return playerTeamAudit;
    }
}