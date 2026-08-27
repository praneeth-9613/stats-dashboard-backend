import { GOALKEEPER_STAT_CONFIG, OUTFIELD_STAT_CONFIG } from "../constants";
import { FotMobPlayer } from "../types/FotmobTypes";
import { MatchDetailsResponse } from "../types/MatchDetails";
import { PlayersDatabase } from "../types/StoredPlayer";
import { MatchesDatabase, StoredMatch, StoredPlayerStats, StoredSeasonPlayerStats, StoredStat } from "../types/StoredStats";

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

function initializeSeasonPlayer(playerId: string, playerName: string, players: Record<string, StoredSeasonPlayerStats>): void {
    players[playerId] = {

        id: Number(playerId),

        name: playerName,

        appearances: 0,

        stats: {},

        ratingSum: 0,

        ratingMatches: 0,

        averageRating: 0
    }
}

function addStats(playerId: string, players: Record<string, StoredSeasonPlayerStats>, matchPlayer: StoredPlayerStats) {
    const seasonPlayer =
        players[playerId];

    const minutes =
        matchPlayer.stats.minutes_played?.value ?? 0;

    if (minutes > 0) {
        seasonPlayer.appearances++
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
        seasonPlayer.ratingSum += rating;
        seasonPlayer.ratingMatches++;
    }
}

function initializeOrUpdateSeasonPlayer(playerId: string, playerName: string, matchPlayer: StoredPlayerStats, players: Record<string, StoredSeasonPlayerStats>) {
    if (!players[playerId]) {
        initializeSeasonPlayer(playerId, playerName, players);
    }

    addStats(playerId, players, matchPlayer);
}

function addStatsForSquadPlayers(players: Record<string, StoredSeasonPlayerStats>, squadPlayers: PlayersDatabase, match: StoredMatch) {
    for (const player of Object.values(squadPlayers)) {

        const playerId = String(player.id);

        if (!(playerId in match.players)) {

            if (players[playerId]) continue;

            initializeSeasonPlayer(playerId, player.name, players);

            continue;
        };

        const matchPlayer = match.players[playerId];

        initializeOrUpdateSeasonPlayer(playerId, player.name, matchPlayer, players);
    }
}

function addStatsForMatchPlayers(players: Record<string, StoredSeasonPlayerStats>, squadPlayers: PlayersDatabase, match: StoredMatch) {
    const matchPlayers = Object.values(match.players);
    
    for (const matchPlayer of matchPlayers) {

        const playerId = String(matchPlayer.id);

        if (playerId in squadPlayers) continue; // already processed in squad loop

        initializeOrUpdateSeasonPlayer(playerId, matchPlayer.name, matchPlayer, players);
    }
}

export function calculateSeasonStats(
    matches: MatchesDatabase,
    squadPlayers: PlayersDatabase
): Record<string, StoredSeasonPlayerStats> {

    const players: Record<string, StoredSeasonPlayerStats> = {};

    for (const match of Object.values(matches)) {

        addStatsForSquadPlayers(players, squadPlayers, match);

        addStatsForMatchPlayers(players, squadPlayers, match);
    }

    const result: Record<string, StoredSeasonPlayerStats> = {};

    for (
        const [playerId, player]
        of Object.entries(players)
    ) {

        result[playerId] = {
            ...player,

            averageRating:
                (player.ratingMatches > 0)
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