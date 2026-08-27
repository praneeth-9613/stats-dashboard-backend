import { getFixturesToProcess } from "./helpers/FixturesHelpers";
import { processMatches } from "./helpers/ProcessHelpers";
import { SyncPhase } from "./SyncPhase";
import { Fixture } from "./types/FixtureTypes";
import { PlayersDatabase } from "./types/StoredPlayer";
import { MatchesDatabase } from "./types/StoredStats";

export class SeasonStatsPhase extends SyncPhase {

    async run(
        matches: MatchesDatabase,
        completedMatches: Fixture[],
        players: PlayersDatabase
    ) {
        const {
            teamId,
            teamName,
            refresh,
            scrapeStatus
        } = this.context;

        const newFixtures = getFixturesToProcess(completedMatches, matches, refresh);

        console.log(
            `New matches to process: ` +
            `${newFixtures.length}`
        );

        await this.execute(
            "season_stats",
            newFixtures.length,
            newFixtures.length > 0 ? "Computing season stats for completed matches" : "No new completed matches to process",
            () => processMatches(newFixtures, matches, teamId, teamName, players, scrapeStatus)
        );
    }
}