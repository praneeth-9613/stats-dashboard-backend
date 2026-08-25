import { Fixture } from "./types/FixtureTypes";
import { ensureDataDirectory } from "./helpers/DirectoryHelpers";
import { fetchSeasonFixtures, fetchTeamInfo, getCompletedFixtures, getFixturesToAdd, getFixturesToProcess } from "./helpers/FixturesHelpers";
import { loadMatches, loadPlayers } from "./helpers/StorageHelpers";
import { addMatches, processMatches, processPlayers } from "./helpers/ProcessHelpers";
import { fetchSquadPlayers, getNewPlayerIds } from "./helpers/PlayerHelpers";
import { ScraperOptions } from "./types/Common";
import { completePhase, startPhase } from "./helper";

export async function main({
    teamId,
    teamName,
    resync,
    playerIds,
    matchIds,
    scrapeStatuses = {}
}: ScraperOptions): Promise<void> {

    const scrapeStatus = scrapeStatuses[teamId];

    if (!teamId || !teamName) {
        console.error("Both teamId and teamName are required !");
        process.exit(1);
    }

    console.log(
        `Starting Processing for ${teamName} : ${teamId}`
    );

    console.log(
        resync
            ? "🔄 FULL RESYNC"
            : "▶️ Normal sync"
    );

    ensureDataDirectory(teamId);

    const teamInfo = await fetchTeamInfo(teamId);

    const existingPlayers =
        await loadPlayers(teamId);

    console.log(
        `Previously processed players: ` +
        `${Object.keys(existingPlayers).length}`
    );

    const allPlayerIds: number[] = await fetchSquadPlayers(teamInfo);

    const newPlayerIds: Set<number> =
        getNewPlayerIds(
            existingPlayers,
            allPlayerIds,
            resync
        );

    console.log(
        `New players to process: ` +
        `${newPlayerIds.size}`
    );

    startPhase(
        scrapeStatus,
        "players",
        newPlayerIds.size,
        newPlayerIds.size > 0 ? "Processing player profiles" : "No new players to process"
    );

    const processedPlayers = await processPlayers(
        newPlayerIds,
        existingPlayers,
        teamId,
        teamName,
        scrapeStatus
    );

    completePhase(scrapeStatus, "players");

    const matches = loadMatches(teamId);

    console.log(
        `Previously processed matches: ` +
        `${Object.keys(matches).length}`
    );

    const seasonFixtures: Fixture[] =
        await fetchSeasonFixtures(teamInfo);

    const completedFixtures: Fixture[] =
        getCompletedFixtures(
            seasonFixtures
        );

    const fixturesToAdd = getFixturesToAdd(seasonFixtures, completedFixtures, matches, resync);

    console.log(
        `New matches to add: ` +
        `${fixturesToAdd.length}`
    );

    startPhase(
        scrapeStatus,
        "fixtures",
        fixturesToAdd.length,
        fixturesToAdd.length > 0 ? "Adding fixtures to schedule" : "No new fixtures to add to schedule"
    );

    await addMatches(fixturesToAdd, matches, teamId, scrapeStatus);

    console.log(
        `Completed season fixtures: ` +
        `${completedFixtures.length}`
    );

    completePhase(scrapeStatus, "fixtures");

    const newFixtures = getFixturesToProcess(completedFixtures, matches, resync);

    console.log(
        `New matches to process: ` +
        `${newFixtures.length}`
    );

    startPhase(
        scrapeStatus,
        "season_stats",
        newFixtures.length,
        newFixtures.length > 0 ? "Computing season stats for completed matches" : "No new completed matches to process"
    );

    await processMatches(newFixtures, matches, teamId, teamName, processedPlayers, scrapeStatus);

    completePhase(scrapeStatus, "season_stats");
}