
import "reflect-metadata";
import "dotenv/config";

import { DataSource } from "typeorm";
import { Team } from "./entities/Team";
import { LeagueSeasonTeam } from "./entities/LeagueSeasonTeam";
import { Squad } from "./entities/Squad";
import { SquadAudit } from "./entities/SquadAudit";
import { Fixture } from "./entities/Fixture";
import { FixtureAudit } from "./entities/FixtureAudit";
import { Player } from "./entities/Player";
import { PlayerAudit } from "./entities/PlayerAudit";
import { PlayerTeam } from "./entities/PlayerTeam";
import { PlayerTeamAudit } from "./entities/PlayerTeamAudit";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,

    entities: [Team, LeagueSeasonTeam, Squad, SquadAudit, Fixture, FixtureAudit, Player, PlayerAudit, PlayerTeam, PlayerTeamAudit],

    migrations: [
        "persistence/migrations/*.ts",
    ],

    synchronize: false,
    logging: false,
});