import { ensureDataDirectory } from "./helpers/DirectoryHelpers";
import { fetchTeamInfo, } from "./helpers/FixturesHelpers";
import { ScraperOptions, SyncContext } from "./types/Common";
import { PlayersPhase } from "./PlayersPhase";
import { FixturesPhase } from "./FixturesPhase";
import { SeasonStatsPhase } from "./SeasonStatsPhase";
import { AcademyPlayersPhase } from "./AcademyPlayersPhase";

export async function main({
    teamId,
    teamName,
    playerIds,
    matchIds,
    scrapeStatuses = {},
    refresh = false,
    scope = "all"
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
        refresh
            ? scope === "all" ? "🔄 FULL REFRESH" : `🔄 REFRESH ${scope}`
            : "▶️ SYNC NEW"
    );

    ensureDataDirectory(teamId);

    const teamInfo = await fetchTeamInfo(teamId);

    const context: SyncContext = {
        teamId,
        teamName,
        refresh,
        scope,
        scrapeStatus,
    };

    const playersPhase = new PlayersPhase(context)
    const { final: players, cachedPlayerIds } = await playersPhase.run(teamInfo);

    const fixturesPhase = new FixturesPhase(context)
    const { final: matches, completedMatches } = await fixturesPhase.run(teamInfo);

    const seasonStatsPhase = new SeasonStatsPhase(context);
    await seasonStatsPhase.run(matches, completedMatches, players);

    const academyPlayersPhase = new AcademyPlayersPhase(context);
    await academyPlayersPhase.run(matches, players, cachedPlayerIds);
}
