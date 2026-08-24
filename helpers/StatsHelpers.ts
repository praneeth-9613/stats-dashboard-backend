import { GOALKEEPER_STAT_CONFIG, OUTFIELD_STAT_CONFIG } from "../constants";
import { FotMobPlayer } from "../types/FotmobTypes";
import { MatchDetailsResponse } from "../types/MatchDetails";
import { MatchesDatabase, StoredPlayer, StoredStat } from "../types/StoredStats";

export function extractTeamSpecificPlayers(
    matchData: MatchDetailsResponse,
    teamId: number
): Record<string, StoredPlayer> {

    const playerStats =
        matchData.content?.playerStats ?? {};

    const players: Record<string, StoredPlayer> = {};

    for (const player of Object.values(playerStats)) {

        if (player.teamId !== teamId) {
            continue;
        }

        players[String(player.id)] = {

            id:
                player.id,

            name:
                player.name,

            shirtNumber:
                player.shirtNumber ?? null,

            isGoalkeeper:
                player.isGoalkeeper ?? false,

            positionId:
                player.positionId ?? null,

            usualPosition:
                player.usualPosition ?? null,

            stats:
                extractPlayerStats(player)
        };
    }

    return players;
}

function extractPlayerStats(
    player: FotMobPlayer
): Record<string, StoredStat> {

    const extracted: Record<string, StoredStat> = {};

    const statConfig =
        player.isGoalkeeper
            ? GOALKEEPER_STAT_CONFIG
            : OUTFIELD_STAT_CONFIG;

    for (const section of player.stats ?? []) {

        const sectionKey =
            section.key;

        const wantedStats =
            statConfig[sectionKey];

        // Ignore sections we're not interested in.
        if (!wantedStats) {
            continue;
        }

        for (
            const statWrapper
            of Object.values(section.stats ?? {})
        ) {

            const fotmobKey =
                statWrapper.key;

            // FotMob sometimes has key: null
            if (!fotmobKey) {
                continue;
            }

            if (!wantedStats.includes(fotmobKey)) {
                continue;
            }

            const stat =
                statWrapper.stat;

            const value =
                stat.value ?? 0;

            if (stat.total !== undefined) {

                extracted[fotmobKey] = {
                    value,
                    total: stat.total
                };

            } else {

                extracted[fotmobKey] = {
                    value
                };
            }
        }
    }

    return extracted;
}

export function calculateSeasonStats(
    matches: MatchesDatabase
): Record<string, {
    id: number;
    name: string;
    shirtNumber: string | null;
    isGoalkeeper: boolean;
    appearances: number;
    averageRating: number | null;
    stats: Record<string, StoredStat>;
}> {

    const players: Record<string, {
        id: number;
        name: string;
        shirtNumber: string | null;
        isGoalkeeper: boolean;
        appearances: number;
        stats: Record<string, StoredStat>;
        ratingSum: number;
        ratingMatches: number;
    }> = {};

    for (const match of Object.values(matches)) {

        for (const player of Object.values(match.players)) {

            const playerId = String(player.id);

            if (!players[playerId]) {

                players[playerId] = {

                    id: player.id,

                    name: player.name,

                    shirtNumber:
                        player.shirtNumber,

                    isGoalkeeper:
                        player.isGoalkeeper,

                    appearances: 0,

                    stats: {},

                    ratingSum: 0,

                    ratingMatches: 0
                };
            }

            const seasonPlayer =
                players[playerId];


            const minutes =
                player.stats.minutes_played?.value ?? 0;

            if (minutes > 0) {
                seasonPlayer.appearances++;
            }


            for (
                const [key, stat]
                of Object.entries(player.stats)
            ) {

                if (key === "rating_title") {
                    continue;
                }

                addStat(
                    seasonPlayer.stats,
                    key,
                    stat
                );
            }

            const rating =
                player.stats.rating_title?.value;

            if (
                rating !== undefined &&
                minutes > 0
            ) {

                seasonPlayer.ratingSum += rating;

                seasonPlayer.ratingMatches++;
            }
        }
    }

    const result: Record<string, {
        id: number;
        name: string;
        shirtNumber: string | null;
        isGoalkeeper: boolean;
        appearances: number;
        averageRating: number | null;
        stats: Record<string, StoredStat>;
    }> = {};

    for (
        const [playerId, player]
        of Object.entries(players)
    ) {

        result[playerId] = {

            id:
                player.id,

            name:
                player.name,

            shirtNumber:
                player.shirtNumber,

            isGoalkeeper:
                player.isGoalkeeper,

            appearances:
                player.appearances,

            averageRating:
                player.ratingMatches > 0
                    ? Number(
                        (
                            player.ratingSum /
                            player.ratingMatches
                        ).toFixed(2)
                    )
                    : null,

            stats:
                player.stats
        };
    }

    return result;
}

function addStat(
    seasonStats: Record<string, StoredStat>,
    key: string,
    stat: StoredStat
): void {

    if (!seasonStats[key]) {
        seasonStats[key] = {
            value: stat.value,
            ...(stat.total !== undefined
                ? { total: stat.total }
                : {})
        };

        return;
    }

    seasonStats[key].value += stat.value;

    if (stat.total !== undefined) {
        seasonStats[key].total =
            (seasonStats[key].total ?? 0) + stat.total;
    }
}