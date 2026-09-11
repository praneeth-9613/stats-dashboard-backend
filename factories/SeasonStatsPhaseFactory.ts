import { inject, injectable } from "tsyringe";
import { SyncContext } from "../application/types/Common";
import { SeasonStatsMapper } from "../application/mappers/SeasonStatsMapper";
import { SeasonStatsPhase } from "../phases/SeasonStatsPhase";
import { MatchProcessingService } from "../service/MatchProcessingService";
import { SeasonStatsService } from "../service/SeasonStatsService";

@injectable()
export class SeasonStatsPhaseFactory {
    constructor(
        @inject(SeasonStatsMapper)
        private readonly seasonStatsMapper: SeasonStatsMapper,
        @inject(MatchProcessingService)
        private readonly matchProcessingService: MatchProcessingService,
        @inject(SeasonStatsService)
        private readonly seasonStatsService: SeasonStatsService,
    ) { }

    create(context: SyncContext): SeasonStatsPhase {
        return new SeasonStatsPhase(
            context,
            this.seasonStatsMapper,
            this.matchProcessingService,
            this.seasonStatsService
        );
    }
}