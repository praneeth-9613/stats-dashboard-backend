import "reflect-metadata";
import { container } from "tsyringe";

import { AppDataSource } from "./persistence/data-source";
import { Player } from "./persistence/entities/Player";
import { PlayerTeam } from "./persistence/entities/PlayerTeam";
import { PlayerAudit } from "./persistence/entities/PlayerAudit";
import { PlayerTeamAudit } from "./persistence/entities/PlayerTeamAudit";
import { PlayerRepository } from "./persistence/repositories/PlayerRepository";
import { PlayerTeamRepository } from "./persistence/repositories/PlayerTeamRepository";
import { PlayerAuditRepository } from "./persistence/repositories/PlayerAuditRepository";
import { PlayerTeamAuditRepository } from "./persistence/repositories/PlayerTeamAuditRepository";
import { TOKENS } from "./tokens";
import { Fixture } from "./persistence/entities/Fixture";
import { FixtureRepository } from "./persistence/repositories/FixtureRepository";
import { FixtureAudit } from "./persistence/entities/FixtureAudit";
import { FixtureAuditRepository } from "./persistence/repositories/FixtureAuditRepository";
import { League } from "./persistence/entities/League";
import { LeagueRepository } from "./persistence/repositories/LeagueRepository";
import { Team } from "./persistence/entities/Team";
import { TeamRepository } from "./persistence/repositories/TeamRepository";
import { LeagueSeasonTeam } from "./persistence/entities/LeagueSeasonTeam";
import { LeagueSeasonTeamRepository } from "./persistence/repositories/LeagueSeasonTeamRepository";
import { ReserveTeam } from "./persistence/entities/ReserveTeam";
import { ReserveTeamRepository } from "./persistence/repositories/ReserveTeamRepository";
import { MatchPlayerStats } from "./persistence/entities/MatchPlayerStats";
import { MatchPlayerStatsRepository } from "./persistence/repositories/MatchPlayerStatsRepository";
import { MatchGoalscorers } from "./persistence/entities/MatchGoalscorers";
import { MatchGoalscorersRepository } from "./persistence/repositories/MatchGoalscorersRepository";
import { TeamSeasonStats } from "./persistence/entities/TeamSeasonStats";
import { TeamSeasonStatsRepository } from "./persistence/repositories/TeamSeasonStatsRepository";

// repositories
container.register(TOKENS.PlayerOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(Player),
});

container.registerSingleton(PlayerRepository);

container.register(TOKENS.PlayerTeamOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(PlayerTeam),
});

container.registerSingleton(PlayerTeamRepository);

container.register(TOKENS.PlayerAuditOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(PlayerAudit),
});

container.registerSingleton(PlayerAuditRepository);

container.register(TOKENS.PlayerTeamAuditOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(PlayerTeamAudit),
});

container.registerSingleton(PlayerTeamAuditRepository);

container.register(TOKENS.FixtureOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(Fixture),
});

container.registerSingleton(FixtureRepository);

container.register(TOKENS.FixtureAuditOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(FixtureAudit),
});

container.registerSingleton(FixtureAuditRepository);

container.register(TOKENS.LeagueOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(League),
});

container.registerSingleton(LeagueRepository);

container.register(TOKENS.TeamOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(Team),
});

container.registerSingleton(TeamRepository);

container.register(TOKENS.ReserveTeamOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(ReserveTeam),
});

container.registerSingleton(ReserveTeamRepository);

container.register(TOKENS.LeagueSeasonTeamOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(LeagueSeasonTeam),
});

container.registerSingleton(LeagueSeasonTeamRepository);

container.register(TOKENS.MatchPlayerStatsOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(MatchPlayerStats),
})

container.registerSingleton(MatchPlayerStatsRepository);

container.register(TOKENS.MatchGoalscorersOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(MatchGoalscorers),
})

container.registerSingleton(MatchGoalscorersRepository);

container.register(TOKENS.TeamSeasonStatsOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(TeamSeasonStats),
})

container.registerSingleton(TeamSeasonStatsRepository);

export { container };