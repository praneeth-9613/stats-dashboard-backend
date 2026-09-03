import "reflect-metadata";
import { container } from "tsyringe";

import { AppDataSource } from "./persistence/data-source";
import { Player } from "./persistence/entities/Player";
import { PlayerTeam } from "./persistence/entities/PlayerTeam";
import { PlayerAudit } from "./persistence/entities/PlayerAudit";
import { PlayerTeamAudit } from "./persistence/entities/PlayerTeamAudit";
import { Squad } from "./persistence/entities/Squad";
import { SquadAudit } from "./persistence/entities/SquadAudit";
import { PlayerRepository } from "./persistence/repositories/PlayerRepository";
import { PlayerTeamRepository } from "./persistence/repositories/PlayerTeamRepository";
import { PlayerAuditRepository } from "./persistence/repositories/PlayerAuditRepository";
import { PlayerTeamAuditRepository } from "./persistence/repositories/PlayerTeamAuditRepository";
import { SquadRepository } from "./persistence/repositories/SquadRepository";
import { SquadAuditRepository } from "./persistence/repositories/SquadAuditRepository";
import { TOKENS } from "./tokens";

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

container.register(TOKENS.SquadOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(Squad),
});

container.registerSingleton(SquadRepository);

container.register(TOKENS.SquadAuditOrmRepository, {
    useFactory: (container) =>
        AppDataSource.getRepository(SquadAudit),
});

container.registerSingleton(SquadAuditRepository);

export { container };