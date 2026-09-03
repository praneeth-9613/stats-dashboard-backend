import { Repository } from "typeorm";
import { Fixture } from "../entities/Fixture";
import { LeagueSeasonTeamIdentifier } from "../../application/types/PhaseInput";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../tokens";

@injectable()
export class FixtureRepository {
    constructor(
        @inject(TOKENS.FixtureOrmRepository)
        private readonly repository: Repository<Fixture>
    ) { }

    async findByLeagueSeasonTeam(leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier): Promise<Fixture[]> {
        return this.repository.findBy({ season: leagueSeasonTeamIdentifier.season, leagueId: leagueSeasonTeamIdentifier.leagueId, teamId: leagueSeasonTeamIdentifier.teamId });
    }

    async findByMatchId(matchId: number): Promise<Fixture | null> {
        return this.repository.findOneBy({ matchId });
    }

    async save(fixture: Fixture): Promise<Fixture> {
        return this.repository.save(fixture);
    }

    async saveAll(fixtures: Fixture[]): Promise<Fixture[]> {
        return this.repository.save(fixtures);
    }
}