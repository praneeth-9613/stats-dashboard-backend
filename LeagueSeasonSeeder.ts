import { fetchJson } from "./helpers/DirectoryHelpers";
import { LeagueResponse } from "./api/types/RawLeague";
import { TeamData } from "./application/types/TeamData";
import { Team } from "./persistence/entities/Team";
import { TeamMapper } from "./persistence/mappers/TeamEntityMapper";
import { TeamRepository } from "./persistence/repositories/TeamRepository";
import { LeagueSeasonTeamRepository } from "./persistence/repositories/LeagueSeasonTeamRepository";
import { LeagueSeasonTeam } from "./persistence/entities/LeagueSeasonTeam";
import { LeagueRepository } from "./persistence/repositories/LeagueRepository";
import { inject, injectable } from "tsyringe";
import { AppDataSource } from "./persistence/data-source";

@injectable()
export class LeagueSeasonSeeder {

    constructor(
        @inject(TeamMapper)
        private readonly teamMapper: TeamMapper,
        @inject(TeamRepository)
        private readonly teamRepository: TeamRepository,
        @inject(LeagueRepository)
        private readonly leagueRepository: LeagueRepository,
        @inject(LeagueSeasonTeamRepository)
        private readonly leagueSeasonTeamRepository: LeagueSeasonTeamRepository) { }

    async run(seedContext: { leagueId: number, season: string }) {

        try {
            await AppDataSource.initialize();

            const { leagueId, season } = seedContext;

            const LEAGUE_URL = `https://www.fotmob.com/api/data/leagues?id=${leagueId}&ccode3=IND&season=${encodeURIComponent(season)}`;

            const leagueResponse =
                await fetchJson<LeagueResponse>(
                    LEAGUE_URL
                );

            const leagueName = leagueResponse.details.name;

            await this.leagueRepository.ensure(leagueId, leagueName);

            const teams: TeamData[] = leagueResponse.table[0].data.table.all.map(team => { return { id: team.id, name: team.name } });

            const teamEntities: Team[] = teams.map(team => this.teamMapper.toTeamEntity(team));

            const leagueSeasonTeamEntities: LeagueSeasonTeam[] = teams.map(team => this.teamMapper.toLeagueSeasonTeamEntity(team.id, leagueId, season));

            await this.teamRepository.saveAll(teamEntities);

            this.leagueSeasonTeamRepository.saveAll(leagueSeasonTeamEntities)

        }
        catch (err) {
            console.error("Seed failed with " + err)
        }
    }
}