import { FOTMOB_PLAYER_API_URL } from "../constants";
import { FotMobPlayerInformation, FotmobPlayerInjuryInformation, FotMobPlayerResponse } from "../types/FotmobTypes";
import { InjuryInformation, PLAYER_INFORMATION_MAP, PlayerInformation } from "../types/PlayerInformationTypes";
import { PlayersDatabase, StoredPlayerData } from "../types/StoredPlayer";
import { MatchesDatabase } from "../types/StoredStats";
import { TeamResponse } from "../types/Team";
import { fetchJson } from "./DirectoryHelpers";

export async function fetchSquadPlayers(teamInfo: TeamResponse): Promise<Set<number>> {
    return new Set(teamInfo?.squad?.squad?.filter(sq => sq.title.toLowerCase() !== "coach").map(sq => sq.members.map(member => member.id).flat()).flat() ?? []);
}

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

        positions: data.positionDescription.positions?.map((position) => { return { ...position.strPosShort, isMainPosition: position.isMainPosition } }) ?? null,

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
    cachedPlayerIds: Set<number>,
    allPlayerIds: Set<number>
): Set<number> {
    return new Set(
        Array.from(allPlayerIds).filter(
            playerId => !cachedPlayerIds.has(playerId)
        )
    );
}

export function findAcademyPlayersNotInSquad(matches: MatchesDatabase, newPlayerIds: Set<number>) {
    const matchPlayerIds = new Set(
        Object.values(matches).flatMap(match =>
            Object.values(match.players).map(player => player.id)
        )
    );

    return new Set(
        [...matchPlayerIds].filter(
            playerId => !newPlayerIds.has(playerId)
        )
    );
}