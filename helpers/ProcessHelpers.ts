import path from "path";
import { FOTMOB_MATCH_API_URL } from "../constants";
import { Fixture } from "../types/FixtureTypes";
import { GoalEvent, MatchDetailsResponse, MatchHeaderEvents, PlayerOfTheMatch } from "../types/MatchDetails";
import { PlayersDatabase } from "../types/StoredPlayer";
import { MatchesDatabase, StoredGoalEvent, StoredGoalscorers, StoredMatch, StoredPOM } from "../types/StoredStats";
import { fetchJson, getDataDirectory, saveJson } from "./DirectoryHelpers";
import { fetchPlayerData } from "./PlayerHelpers";
import { calculateSeasonStats, extractTeamSpecificPlayers } from "./StatsHelpers";
import { ScrapeStatus } from "../types/Common";
import { sleep, updateEmptyProgress, updateProgress } from "../helper";

export async function processMatches(completedFixtures: Fixture[], matches: MatchesDatabase, teamId: number, teamName: string, processedPlayers: PlayersDatabase, scrapeStatus: ScrapeStatus): Promise<void> {
    const MATCHES_FILE = path.join(getDataDirectory(teamId), "matches.json");

    const SEASON_FILE = path.join(getDataDirectory(teamId), "season-stats.json");

    let matchIndex = 0;

    if (completedFixtures.length === 0) {
        await updateEmptyProgress(scrapeStatus);

        return;
    }

    for (const fixture of completedFixtures) {
        try {
            updateProgress(
                scrapeStatus,
                ++matchIndex,
                `Computing season statistics ${matchIndex} of ${completedFixtures.length}`
            );

            const match =
                await processMatch(
                    fixture,
                    teamId
                );

            matches[String(fixture.id)] =
                match;

            // Save after every match.
            saveJson<MatchesDatabase>(
                MATCHES_FILE,
                matches
            );

            console.log(
                `✓ Saved match ${fixture.id}`
            );

            await sleep(1000);

        } catch (error) {

            console.error(
                `✗ Failed match ${fixture.id}`
            );

            if (error instanceof Error) {
                console.error(
                    error.message
                );
            } else {
                console.error(error);
            }
        }
    }

    const seasonStats =
        calculateSeasonStats(
            matches,
            processedPlayers
        );

    saveJson(
        SEASON_FILE,
        {

            team:
                teamName,

            teamId:
                teamId,

            generatedAt:
                new Date().toISOString(),

            matchesProcessed:
                Object.keys(matches).length,

            players:
                seasonStats
        }
    );

    console.log("");
    console.log(
        "========================================"
    );
    console.log(
        `${teamName} season stats updated`
    );
    console.log(
        "========================================"
    );

    console.log(
        `Matches processed: ` +
        `${Object.keys(matches).length}`
    );
}

async function processMatch(
    fixture: Fixture,
    teamId: number
): Promise<StoredMatch> {

    const matchId =
        fixture.id;

    console.log(
        `Processing ${matchId} | ` +
        `${fixture.opponent?.name} | ` +
        `${fixture.tournament?.name}`
    );

    const url = `${FOTMOB_MATCH_API_URL}${matchId}`;

    const matchData =
        await fetchJson<MatchDetailsResponse>(
            url
        );

    const players =
        extractTeamSpecificPlayers(
            matchData,
            teamId
        );

    return {
        matchId,

        date:
            fixture.status?.utcTime ?? null,

        competition:
            fixture.tournament?.name ?? null,

        tournamentId:
            fixture.tournament?.leagueId ?? null,

        opponent: {

            id:
                fixture.opponent?.id ?? null,

            name:
                fixture.opponent?.name ?? null
        },

        home:
            fixture.home ?? null,

        away:
            fixture.away ?? null,

        score:
            fixture.status?.scoreStr ?? null,

        scoreIncludesPenaltyShootout: fixture?.status?.reason?.long === "After penalties",

        players,

        playerOfTheMatch: extractPOM(matchData?.content?.matchFacts?.playerOfTheMatch ?? null),

        stadium: matchData?.content?.matchFacts?.infoBox?.Stadium ?? null,

        finalStatus: fixture?.status?.reason?.long ?? null,

        goalscorers: extractGoalscorers(matchData?.header?.events ?? null),

        isCompleted: fixture?.status?.finished === true,
    };
}

export async function addMatches(newFixtures: Fixture[], matches: MatchesDatabase, teamId: number, scrapeStatus: ScrapeStatus): Promise<MatchesDatabase> {
    const MATCHES_FILE = path.join(getDataDirectory(teamId), "matches.json");

    let fixtureIndex = 0;

    if (newFixtures.length === 0) {
        await updateEmptyProgress(scrapeStatus);

        return matches;
    }

    for (const fixture of newFixtures) {

        updateProgress(scrapeStatus, ++fixtureIndex, `Adding match ${fixtureIndex} of ${newFixtures.length}`)

        try {
            const match =
                await addUpcomingMatch(
                    fixture
                );

            matches[String(fixture.id)] =
                match;

            // Save after every match.
            saveJson<MatchesDatabase>(
                MATCHES_FILE,
                matches
            );

            console.log(
                `✓ Saved match ${fixture.id}`
            );

            await sleep(1000);

        } catch (error) {

            console.error(
                `✗ Failed match ${fixture.id}`
            );

            if (error instanceof Error) {
                console.error(
                    error.message
                );
            } else {
                console.error(error);
            }
        }
    }

    console.log(
        `Matches added: ` +
        `${Object.keys(matches).length}`
    );

    return matches;
}

async function addUpcomingMatch(fixture: Fixture): Promise<StoredMatch> {
    const matchId =
        fixture.id;

    console.log(
        `Adding ${matchId} | ` +
        `${fixture.opponent?.name} | ` +
        `${fixture.tournament?.name} to schedule`
    );

    const url = `${FOTMOB_MATCH_API_URL}${matchId}`;

    const matchData =
        await fetchJson<MatchDetailsResponse>(
            url
        );

    return {
        matchId,

        date:
            fixture.status?.utcTime ?? null,

        competition:
            fixture.tournament?.name ?? null,

        tournamentId:
            fixture.tournament?.leagueId ?? null,

        opponent: {

            id:
                fixture.opponent?.id ?? null,

            name:
                fixture.opponent?.name ?? null
        },

        home:
            fixture.home ?? null,

        away:
            fixture.away ?? null,

        stadium: matchData?.content?.matchFacts?.infoBox?.Stadium ?? null,

        score:
            fixture.status?.scoreStr ?? null,

        scoreIncludesPenaltyShootout: fixture?.status?.reason?.long === "After penalties",

        players: {},

        playerOfTheMatch: null,

        finalStatus: null,

        goalscorers: null,

        isCompleted: fixture?.status?.finished === true
    };
}



function extractGoalscorers(events: MatchHeaderEvents | null): StoredGoalscorers {
    const homeTeamGoals: GoalEvent[] = Object.values(events?.homeTeamGoals ?? {}).flat();
    const awayTeamGoals: GoalEvent[] = Object.values(events?.awayTeamGoals ?? {}).flat();

    const homeGoalscorers: StoredGoalEvent[] = [];
    const awayGoalscorers: StoredGoalEvent[] = [];

    homeTeamGoals.forEach(homeTeamGoal => {
        homeGoalscorers.push(extractGoalEvent(homeTeamGoal));
    })

    awayTeamGoals.forEach(awayTeamGoal => {
        awayGoalscorers.push(extractGoalEvent(awayTeamGoal));
    })

    const goalscorers: StoredGoalscorers = {
        home: homeGoalscorers,
        away: awayGoalscorers
    }

    return goalscorers;
}

function extractGoalEvent(teamGoal: GoalEvent): StoredGoalEvent {
    const goalscorer: StoredGoalEvent = {
        playerId: teamGoal.playerId,
        fullName: teamGoal.fullName,
        lastName: teamGoal.lastName,
        time: teamGoal.time,
        shotType: teamGoal?.shotmapEvent?.shotType ?? null,
        situation: teamGoal?.shotmapEvent?.situation ?? null,
        isOwnGoal: teamGoal?.shotmapEvent?.isOwnGoal ?? false,
        assistInput: teamGoal?.assistInput ?? null
    }

    return goalscorer;
}

function extractPOM(playerOfTheMatch: PlayerOfTheMatch | null): StoredPOM | null {
    if (playerOfTheMatch === null) return null;

    const parsedRating = Number.parseFloat(playerOfTheMatch?.rating?.num ?? "");
    const rating = Number.isNaN(parsedRating) ? null : parsedRating;

    return {
        id: playerOfTheMatch?.id,
        name: playerOfTheMatch.name.fullName,
        teamName: playerOfTheMatch.teamName,
        rating: rating
    }
}

export async function processPlayers(
    newPlayerIds: Set<number>,
    players: PlayersDatabase,
    teamId: number,
    teamName: string,
    scrapeStatus: ScrapeStatus
): Promise<PlayersDatabase> {
    const PLAYERS_FILE = path.join(getDataDirectory(teamId), "players.json");

    let playerIndex = 0;

    if (newPlayerIds.size == 0) {
        await updateEmptyProgress(scrapeStatus);

        return players;
    }

    for (const playerId of newPlayerIds) {

        updateProgress(scrapeStatus, ++playerIndex, `Processing player ${playerIndex} of ${newPlayerIds.size}`)

        console.log(
            `Fetching player ${playerId}...`
        );

        const player =
            await fetchPlayerData(playerId);

        players[String(playerId)] =
            player;

        saveJson<PlayersDatabase>(PLAYERS_FILE, players);

        console.log(
            `✓ Saved player ${player.id} | ${player.name}`
        );

        await sleep(1000);
    }

    console.log("");
    console.log(
        "========================================"
    );
    console.log(
        `${teamName} player profiles updated`
    );
    console.log(
        "========================================"
    );

    console.log(
        `Players processed: ` +
        `${Object.keys(players).length}`
    );

    return players;
}
