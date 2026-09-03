import { injectable } from "tsyringe";
import { Squad } from "../entities/Squad";
import { SquadAudit, SquadAuditAction } from "../entities/SquadAudit";

@injectable()
export class SquadEntityMapper {
    toEntity(playerId: number, teamId: number, leagueId: number, season: string): Squad {
        const squad = new Squad();

        squad.playerId = playerId;
        squad.teamId = teamId;
        squad.leagueId = leagueId;
        squad.season = season;

        return squad;
    }

    toSquadAuditEntity(playerId: number, teamId: number, leagueId: number, season: string, action: SquadAuditAction): SquadAudit {
        const squadAudit = new SquadAudit();

        squadAudit.playerId = playerId;
        squadAudit.teamId = teamId;
        squadAudit.leagueId = leagueId;
        squadAudit.season = season;
        squadAudit.action = action;

        return squadAudit;
    }

    toSquadAuditEntityFromSquad(squad: Squad, action: SquadAuditAction): SquadAudit {
        const squadAudit = new SquadAudit();

        squadAudit.playerId = squad.playerId;
        squadAudit.teamId = squad.teamId;
        squadAudit.leagueId = squad.leagueId;
        squadAudit.season = squad.season;
        squadAudit.action = action;

        return squadAudit;
    }
}