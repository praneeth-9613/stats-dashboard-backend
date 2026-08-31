import { fetchJson } from "./helpers/DirectoryHelpers";
import { LeagueResponse } from "./api/types/RawLeague";
import { TeamData } from "./application/types/TeamData";
import { LEAGUES } from "./constants";
import { Team } from "./persistence/entities/Team";
import { TeamMapper } from "./persistence/mappers/TeamEntityMapper";
import { TeamRepository } from "./persistence/repositories/TeamRepository";
import { LeagueSeasonTeamRepository } from "./persistence/repositories/LeagueSeasonTeamRepository";
import { LeagueSeasonTeam } from "./persistence/entities/LeagueSeasonTeam";

export class LeagueSeasonSeeder {

    constructor(protected readonly seedContext: { leagueId: number, season: string },
        private readonly teamMapper: TeamMapper,
        private readonly teamRepository: TeamRepository,
        private readonly leagueSeasonTeamRepository: LeagueSeasonTeamRepository) { }

    async run() {

        try {
            const { leagueId, season } = this.seedContext;

            const LEAGUE_URL = `https://www.fotmob.com/api/data/leagues?id=${leagueId}&ccode3=IND&season=${encodeURIComponent(season)}`;

            const leagueResponse =
                await fetchJson<LeagueResponse>(
                    LEAGUE_URL
                );

            const teams: TeamData[] = leagueResponse.table[0].data.table.all.map(team => { return { id: team.id, name: team.name, leagueName: LEAGUES[leagueId] } });

            const teamEntities: Team[] = teams.map(team => this.teamMapper.toTeamEntity(team));

            const leagueSeasonTeamEntities: LeagueSeasonTeam[] = teams.map(team => this.teamMapper.toLeagueSeasonTeamEntity(team.id, leagueId, season));

            await this.teamRepository.saveAll(teamEntities);

            this.leagueSeasonTeamRepository.addTeamsToLeagueSeason(leagueSeasonTeamEntities)

        }
        catch (err) {
            console.error("Seed failed with " + err)
        }
    }
}