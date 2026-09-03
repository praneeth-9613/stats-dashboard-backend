
import "reflect-metadata";
import "dotenv/config";

import { DataSource } from "typeorm";
import { Team } from "./entities/Team";
import { LeagueSeasonTeam } from "./entities/LeagueSeasonTeam";
import { Fixture } from "./entities/Fixture";
import { FixtureAudit } from "./entities/FixtureAudit";
import { Player } from "./entities/Player";
import { PlayerAudit } from "./entities/PlayerAudit";
import { PlayerTeam } from "./entities/PlayerTeam";
import { PlayerTeamAudit } from "./entities/PlayerTeamAudit";
import { League } from "./entities/League";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,

    entities: [Team, LeagueSeasonTeam, Fixture, FixtureAudit, Player, PlayerAudit, PlayerTeam, PlayerTeamAudit, League],

    migrations: [
        "persistence/migrations/*.ts",
    ],

    dropSchema: false,
    synchronize: false,
    logging: false,
});