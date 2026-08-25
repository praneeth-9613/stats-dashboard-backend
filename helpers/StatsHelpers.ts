import { GOALKEEPER_STAT_CONFIG, OUTFIELD_STAT_CONFIG } from "../constants";
import { FotMobPlayer } from "../types/FotmobTypes";
import { MatchDetailsResponse } from "../types/MatchDetails";
import { PlayersDatabase } from "../types/StoredPlayer";
import { MatchesDatabase, StoredPlayerStats, StoredStat } from "../types/StoredStats";

export function extractTeamSpecificPlayers(
    matchData: MatchDetailsResponse,
    teamId: number
): Record<string, StoredPlayerStats> {

    const playerStats =
        matchData.content?.playerStats ?? {};

    const players: Record<string, StoredPlayerStats> = {};

    for (const player of Object.values(playerStats)) {

        if (player.teamId !== teamId) {
            continue;
        }

        players[String(player.id)] = {
            id:
                player.id,

            name:
                player.name,

            stats:
                extractPlayerStats(player),

            isGoalkeeper: player.isGoalkeeper ?? false
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
    matches: MatchesDatabase,
    processedPlayers: PlayersDatabase
): Record<string, StoredPlayerStats> {

    const players: Record<string, StoredPlayerStats> = {};

    console.log(processedPlayers);

    for (const match of Object.values(matches)) {

        for (const player of Object.values(processedPlayers)) {

            const playerId = String(player.id);

            if (!(playerId in match.players)) {

                if (players[playerId]) continue;

                players[playerId] = {

                    id: player.id,

                    name: player.name,

                    appearances: 0,

                    isGoalkeeper: player.positions.map(pos => pos.label.toLowerCase()).includes("goalkeeper"),

                    stats: {},

                    ratingSum: 0,

                    ratingMatches: 0,

                    averageRating: 0
                };

                continue;
            };

            if (!players[playerId]) {

                players[playerId] = {

                    id: player.id,

                    name: player.name,

                    appearances: 0,

                    isGoalkeeper: false,

                    stats: {},

                    ratingSum: 0,

                    ratingMatches: 0,

                    averageRating: 0
                };
            }

            const seasonPlayer =
                players[playerId];

            const matchPlayer = match.players[playerId];

            const minutes =
                matchPlayer.stats.minutes_played?.value ?? 0;

            if (minutes > 0) {
                if (seasonPlayer.appearances) {
                    seasonPlayer.appearances++
                } else {
                    seasonPlayer.appearances = 1;
                }
            }

            for (
                const [key, stat]
                of Object.entries(matchPlayer.stats)
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
                matchPlayer.stats.rating_title?.value;

            if (
                rating !== undefined &&
                minutes > 0
            ) {

                if (seasonPlayer.ratingSum && seasonPlayer.ratingMatches) {
                    seasonPlayer.ratingSum += rating;
                    seasonPlayer.ratingMatches++;
                } else {
                    seasonPlayer.ratingSum = rating;
                    seasonPlayer.ratingMatches = 1;
                }
            }
        }
    }

    const result: Record<string, StoredPlayerStats> = {};

    for (
        const [playerId, player]
        of Object.entries(players)
    ) {

        result[playerId] = {
            ...player,

            averageRating:
                (player.ratingSum && player.ratingMatches && player.ratingMatches > 0)
                    ? Number(

                        (player.ratingSum /
                            player.ratingMatches
                        ).toFixed(2))
                    : null
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