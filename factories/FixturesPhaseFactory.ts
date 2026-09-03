import { inject, injectable } from "tsyringe";
import { SyncContext } from "../application/types/Common";
import { SquadAuditRepository } from "../persistence/repositories/SquadAuditRepository";
import { TeamResponse } from "../api/types/RawTeam";
import { FixtureMapper } from "../application/mappers/FixtureMapper";
import { FixtureEntityMapper } from "../persistence/mappers/FixtureEntityMapper";
import { FixtureRepository } from "../persistence/repositories/FixtureRepository";
import { FixtureAuditRepository } from "../persistence/repositories/FixtureAuditRepository";
import { FixtureComparator } from "../comparators/FixtureComparator";
import { FixturesPhase } from "../phases/FixturesPhase";

@injectable()
export class FixturesPhaseFactory {
    constructor(
        @inject(FixtureMapper)
        private readonly fixtureMapper: FixtureMapper,
        @inject(FixtureEntityMapper)
        private readonly fixtureEntityMapper: FixtureEntityMapper,
        @inject(FixtureComparator)
        private readonly fixtureComparator: FixtureComparator,
        @inject(FixtureRepository)
        private readonly fixtureRepository: FixtureRepository,
        @inject(SquadAuditRepository)
        private readonly fixtureAuditRepository: FixtureAuditRepository,
    ) { }

    create(context: SyncContext, teamInfo: TeamResponse): FixturesPhase {
        return new FixturesPhase(
            context,
            teamInfo,
            this.fixtureMapper,
            this.fixtureEntityMapper,
            this.fixtureComparator,
            this.fixtureRepository,
            this.fixtureAuditRepository,
        );
    }
}