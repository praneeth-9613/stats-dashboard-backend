import { inject, injectable } from "tsyringe";
import { SyncContext } from "../application/types/Common";
import { FixtureEntityMapper } from "../persistence/mappers/FixtureEntityMapper";
import { FixtureRepository } from "../persistence/repositories/FixtureRepository";
import { FixtureAuditRepository } from "../persistence/repositories/FixtureAuditRepository";
import { MatchProcessingPhase } from "../phases/MatchProcessingPhase";
import { MatchProcessingPhaseInput } from "../application/types/PhaseInput";
import { MatchMapper } from "../application/mappers/MatchMapper";
import { MatchComparator } from "../comparators/MatchComparator";
import { MatchProcessingService } from "../service/MatchProcessingService";

@injectable()
export class MatchProcessingPhaseFactory {
    constructor(
        @inject(MatchMapper)
        private readonly matchMapper: MatchMapper,
        @inject(MatchComparator)
        private readonly matchComparator: MatchComparator,
        @inject(MatchProcessingService)
        private readonly matchProcessingService: MatchProcessingService,
        @inject(FixtureEntityMapper)
        private readonly fixtureEntityMapper: FixtureEntityMapper,
        @inject(FixtureRepository)
        private readonly fixtureRepository: FixtureRepository,
        @inject(FixtureAuditRepository)
        private readonly fixtureAuditRepository: FixtureAuditRepository,
    ) { }

    create(context: SyncContext, matchProcessingPhaseInput: MatchProcessingPhaseInput): MatchProcessingPhase {
        return new MatchProcessingPhase(
            context,
            matchProcessingPhaseInput,
            this.matchMapper,
            this.matchComparator,
            this.matchProcessingService,
            this.fixtureEntityMapper,
            this.fixtureRepository,
            this.fixtureAuditRepository
        );
    }
}