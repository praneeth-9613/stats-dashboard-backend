import { ensureDataDirectory } from "./helpers/DirectoryHelpers";
import { ScraperOptions, SyncContext } from "./application/types/Common";
import { fetchTeam } from "./helpers/ApiHelpers";

export async function main({
    teamId,
    teamName,
    season,
    leagueId,
    syncType = "sync",
    scope,
    scrapeStatuses = {},
}: ScraperOptions): Promise<void> {

    if (!teamId || !teamName) {
        console.error("Both teamId and teamName are required !");
        process.exit(1);
    }

    console.log(
        `Starting Processing for ${teamName} : ${teamId}`
    );

    console.log(
        syncType === "sync" ? "SYNC" : `REFRESH ${scope}`
    );

    ensureDataDirectory(season, leagueId, teamId);

    const teamInfo = await fetchTeam(teamId);

    const scrapeStatus = scrapeStatuses[teamId];

    const context: SyncContext = {
        teamId,
        teamName,
        season,
        leagueId,
        syncType,
        scope,
        scrapeStatus,
    };

    // const playersPhase = new PlayersPhase(context)
    // const { final: players, cachedPlayerIds } = await playersPhase.run(teamInfo);

    // const fixturesPhase = new FixturesPhase(context)
    // const { final: matches, completedMatches } = await fixturesPhase.run(teamInfo);

    // const seasonStatsPhase = new SeasonStatsPhase(context);
    // await seasonStatsPhase.run(matches, completedMatches, players);

    // const academyPlayersPhase = new AcademyPlayersPhase(context);
    // await academyPlayersPhase.run(matches, players, cachedPlayerIds);
}
