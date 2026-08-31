
import "reflect-metadata";
import "dotenv/config";

import { DataSource } from "typeorm";
import { Team } from "./entities/Team";
import { LeagueSeasonTeam } from "./entities/LeagueSeasonTeam";
import { Squad } from "./entities/Squad";
import { SquadAudit } from "./entities/SquadAudit";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,

    entities: [Team, LeagueSeasonTeam, Squad, SquadAudit],

    migrations: [
        "persistence/migrations/*.ts",
    ],

    synchronize: false,
    logging: false,
});