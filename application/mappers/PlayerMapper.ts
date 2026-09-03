import { injectable } from "tsyringe";
import { PlayerInformationResponse, PlayerInjuryInformationResponse, PlayerResponse } from "../../api/types/RawPlayer"
import { PLAYER_INFORMATION_MAP, PlayerData, PlayerInjuryInformation, PlayerProfile, PlayerTeamData } from "../types/PlayerData"

@injectable()
export class PlayerMapper {

    toPlayerData(playerResponse: PlayerResponse): PlayerData {
        return {
            profile: this.toPlayerProfile(playerResponse),
            positions: {
                list: this.toPlayerPositions(playerResponse)
            },
            injury: this.toPlayerInjuryInformation(playerResponse.injuryInformation),
            team: this.toPlayerTeam(playerResponse)
        }
    }

    toPlayerProfile(playerResponse: PlayerResponse): PlayerProfile {
        const playerProfile: PlayerProfile = {
            id: playerResponse.id,
            name: playerResponse.name,
            birthDate: playerResponse.birthDate?.utcTime ?? null,
            gender: playerResponse.gender,
        }

        this.enrichPlayerInformation(playerResponse.playerInformation, playerProfile);

        return playerProfile;
    }

    enrichPlayerInformation(playerInformationResponse: PlayerInformationResponse[], playerProfile: PlayerProfile): void {
        playerInformationResponse.forEach(elt => {

            const key = PLAYER_INFORMATION_MAP[elt.title];

            if (!key) {
                return;
            }

            playerProfile[key] = elt.value.fallback as never;

        });
    }

    toPlayerPositions(playerResponse: PlayerResponse) {
        return playerResponse.positionDescription.positions?.map((position) => {
            return {
                ...position.strPosShort,
                isMainPosition: position.isMainPosition
            }
        });
    }

    toPlayerInjuryInformation(playerInjuryInformationResponse: PlayerInjuryInformationResponse | null): PlayerInjuryInformation | null {
        if (playerInjuryInformationResponse == null) return null;

        return {
            name: playerInjuryInformationResponse.name,
            key: playerInjuryInformationResponse.key,
            lastUpdated: playerInjuryInformationResponse.lastUpdated.utcTime,
            expectedReturn: playerInjuryInformationResponse.expectedReturn?.expectedReturnFallback ?? null
        };
    }

    toPlayerTeam(playerResponse: PlayerResponse): PlayerTeamData | null {
        if (playerResponse.primaryTeam === null) return null

        const playerTeam: PlayerTeamData = {
            teamId: playerResponse.primaryTeam.teamId,
            teamName: playerResponse.primaryTeam.teamName,
            onLoan: playerResponse.primaryTeam.onLoan,
            isCaptain: playerResponse.isCaptain,
            contractEnd: playerResponse.contractEnd?.utcTime ?? null
        }

        this.enrichPlayerTeam(playerResponse.playerInformation, playerTeam);

        return playerTeam;
    }


    enrichPlayerTeam(playerInformationResponse: PlayerInformationResponse[], playerTeam: PlayerTeamData): void {
        playerInformationResponse.forEach(elt => {

            const key = elt.title.toLowerCase();

            if (key === "shirt") {
                playerTeam[key] = elt.value.fallback as never;
            }

        });
    }
}