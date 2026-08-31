import { getArgValue } from "./helper";
import { LeagueSeasonSeeder } from "./LeagueSeasonSeeder";
import { AppDataSource } from "./persistence/data-source";
import { LeagueSeasonTeam } from "./persistence/entities/LeagueSeasonTeam";
import { Team } from "./persistence/entities/Team";
import { TeamMapper } from "./persistence/mappers/TeamEntityMapper";
import { LeagueSeasonTeamRepository } from "./persistence/repositories/LeagueSeasonTeamRepository";
import { TeamRepository } from "./persistence/repositories/TeamRepository";

async function seed() {
    try {
        await AppDataSource.initialize();

        const leagueId = Number(getArgValue("--leagueId") ?? 0);

        const season = getArgValue("--season") ?? "";

        const seedContext = { leagueId, season };

        console.log(seedContext)

        const leagueSeasonSeeder = new LeagueSeasonSeeder(seedContext, new TeamMapper(), new TeamRepository(AppDataSource.getRepository(Team)), new LeagueSeasonTeamRepository(AppDataSource.getRepository(LeagueSeasonTeam)))

        leagueSeasonSeeder.run();
    }
    catch (err) {
        console.error("seed failed with " + err)
    }
}

await seed();