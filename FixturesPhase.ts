import { fetchSeasonFixtures, getCompletedFixtures, getFixturesToAdd } from "./helpers/FixturesHelpers";
import { addMatches } from "./helpers/ProcessHelpers";
import { loadMatches } from "./helpers/StorageHelpers";
import { SyncPhase } from "./SyncPhase";
import { Fixture } from "./types/FixtureTypes";
import { MatchesPhaseData } from "./types/StoredStats";
import { TeamResponse } from "./types/Team";

export class FixturesPhase extends SyncPhase {

    async run(teamInfo: TeamResponse): Promise<MatchesPhaseData> {
        const {
            teamId,
            refresh,
            scrapeStatus
        } = this.context;

        const cachedMatches = loadMatches(teamId);

        console.log(
            `Previously processed matches: ` +
            `${Object.keys(cachedMatches).length}`
        );

        const seasonFixtures: Fixture[] =
            await fetchSeasonFixtures(teamInfo);

        const completedFixtures: Fixture[] =
            getCompletedFixtures(
                seasonFixtures
            );

        console.log(
            `Completed season fixtures: ` +
            `${completedFixtures.length}`
        );

        const fixturesToAdd = getFixturesToAdd(seasonFixtures, completedFixtures, cachedMatches, refresh);

        console.log(
            `New matches to add: ` +
            `${fixturesToAdd.length}`
        );

        const matches = await this.execute("fixtures",
            fixturesToAdd.length,
            fixturesToAdd.length > 0 ? "Adding fixtures to schedule" : "No new fixtures to add to schedule", 
            () => addMatches(fixturesToAdd, cachedMatches, teamId, scrapeStatus)
        )

        return { final: matches, completedMatches: completedFixtures };
    }
}

