import { container } from "./container";
import { getArgValue } from "./helper";
import { LeagueSeasonSeeder } from "./LeagueSeasonSeeder";

async function seed() {
    try {
        const leagueId = Number(getArgValue("--leagueId") ?? 0);

        const season = getArgValue("--season") || "2026-2027";

        const seedContext = { leagueId, season };

        console.log(seedContext)

        const leagueSeasonSeeder = container.resolve(LeagueSeasonSeeder);

        leagueSeasonSeeder.run(seedContext);
    }
    catch (err) {
        console.error("seed failed with " + err)
    }
}

await seed();