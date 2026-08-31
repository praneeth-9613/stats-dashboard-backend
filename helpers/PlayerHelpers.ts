import { MatchesDatabase } from "../types/StoredStats";

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