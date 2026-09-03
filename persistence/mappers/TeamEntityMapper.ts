import { TeamData } from "../../application/types/TeamData";
import { LeagueSeasonTeam } from "../entities/LeagueSeasonTeam";
import { Team } from "../entities/Team";

export class TeamMapper {
    toTeamEntity(team: TeamData): Team {
        const entity = new Team();

        entity.teamId = team.id;
        entity.name = team.name;
        entity.primaryColor = team.primaryColor ?? null;
        entity.secondaryColor = team.secondaryColor ?? null;

        return entity;
    }

    toLeagueSeasonTeamEntity(teamId: number, leagueId: number, season: string): LeagueSeasonTeam {
        const entity = new LeagueSeasonTeam();

        entity.teamId = teamId;
        entity.leagueId = leagueId
        entity.season = season;

        return entity;
    }
}