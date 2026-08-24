import { Fixture } from "./types/FixtureTypes";
import { ensureDataDirectory } from "./helpers/DirectoryHelpers";
import { fetchSeasonFixtures, getCompletedFixtures, getFixturesToAdd, getFixturesToProcess } from "./helpers/FixturesHelpers";
import { loadMatches, loadPlayers } from "./helpers/StorageHelpers";
import { addMatches, processMatches, processPlayers } from "./helpers/ProcessHelpers";
import { getNewPlayerIds } from "./helpers/PlayerHelpers";
import { ScraperOptions } from "./types/Common";

export async function main({
    teamId,
    teamName,
    resync,
    playerIds,
    matchIds,
}: ScraperOptions): Promise<void> {

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

    const matches = loadMatches(teamName);

    console.log(
        `Previously processed matches: ` +
        `${Object.keys(matches).length}`
    );

    const seasonFixtures: Fixture[] =
        await fetchSeasonFixtures(teamId, teamName);

    const completedFixtures: Fixture[] =
        getCompletedFixtures(
            seasonFixtures
        );

    const fixturesToAdd = getFixturesToAdd(seasonFixtures, completedFixtures, matches, resync);

    console.log(
        `New matches to add: ` +
        `${fixturesToAdd.length}`
    );

    await addMatches(fixturesToAdd, matches, teamId);

    console.log(
        `Completed season fixtures: ` +
        `${completedFixtures.length}`
    );

    const newFixtures = getFixturesToProcess(completedFixtures, matches, resync);

    console.log(
        `New matches to process: ` +
        `${newFixtures.length}`
    );

    await processMatches(newFixtures, matches, teamId, teamName);

    const players =
        await loadPlayers(teamName);

    console.log(
        `Previously processed players: ` +
        `${Object.keys(players).length}`
    );

    const newPlayerIds =
        getNewPlayerIds(
            matches,
            players,
            resync
        );

    console.log(
        `New players to process: ` +
        `${newPlayerIds.size}`
    );

    await processPlayers(
        newPlayerIds,
        players,
        teamId,
        teamName
    );
}