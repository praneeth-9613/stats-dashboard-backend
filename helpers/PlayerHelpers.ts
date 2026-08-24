import { FOTMOB_PLAYER_API_URL } from "../constants";
import { FotMobPlayerInformation, FotmobPlayerInjuryInformation, FotMobPlayerResponse } from "../types/FotmobTypes";
import { InjuryInformation, PLAYER_INFORMATION_MAP, PlayerInformation } from "../types/PlayerInformationTypes";
import { PlayersDatabase, StoredPlayerData } from "../types/StoredPlayer";
import { MatchesDatabase } from "../types/StoredStats";
import { fetchJson } from "./DirectoryHelpers";

export async function fetchPlayerData(
    playerId: number
): Promise<StoredPlayerData> {

    const data =
        await fetchJson<FotMobPlayerResponse>(
            `${FOTMOB_PLAYER_API_URL}${playerId}`
        );

    return extractPlayerData(data);
}

function extractPlayerData(
    data: FotMobPlayerResponse
): StoredPlayerData {

    console.log(
        `Processing player ${data.name}`);

    return {
        id: data.id,

        name: data.name,

        birthDate:
            data.birthDate ?? null,

        positions: data.positionDescription.positions.map((position) => { return { ...position.strPosShort, isMainPosition: position.isMainPosition } }) ?? null,

        playerInformation:
            extractPlayerInformation(data.playerInformation),

        injuryInformation:
            extractInjuryInformation(data.injuryInformation),

        contractEnd:
            data.contractEnd?.utcTime ?? null
    };
}

function extractPlayerInformation(fotmobPlayerInformation: FotMobPlayerInformation[]): PlayerInformation {
    const playerInformation: PlayerInformation = {
        age: null,
        country: null,
        height: null,
        preferred_foot: null,
        transfer_value: null,
        shirt: null,

    };
    fotmobPlayerInformation.forEach(elt => {

        const key = PLAYER_INFORMATION_MAP[elt.title];

        if (!key) {
            return;
        }

        playerInformation[key] = elt.value.fallback as never;

    })

    return playerInformation;
}

function extractInjuryInformation(fotmobPlayerInjuryInformation: FotmobPlayerInjuryInformation | null): InjuryInformation | null {
    if (fotmobPlayerInjuryInformation == null) return null;

    const injuryInformation: InjuryInformation = {
        name: fotmobPlayerInjuryInformation.name,
        key: fotmobPlayerInjuryInformation.key,
        lastUpdated: fotmobPlayerInjuryInformation.lastUpdated,
        expectedReturn: fotmobPlayerInjuryInformation.expectedReturn?.expectedReturnFallback ?? null
    };

    return injuryInformation;
}

export function getNewPlayerIds(
    matches: MatchesDatabase,
    players: PlayersDatabase,
    resync: boolean = false
): Set<number> {

    const existingPlayerIds =
        new Set(
            Object.values(players)
                .map(player => player.id)
        );

    const newPlayerIds =
        new Set<number>();

    for (const match of Object.values(matches)) {

        for (const player of Object.values(match.players)) {

            if (resync) {
                newPlayerIds.add(player.id);
                continue;
            }

            if (!existingPlayerIds.has(player.id)) {

                newPlayerIds.add(player.id);
            }
        }
    }

    return newPlayerIds;
}