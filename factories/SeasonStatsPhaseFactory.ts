import { inject, injectable } from "tsyringe";
import { SyncContext } from "../application/types/Common";
import { SeasonStatsMapper } from "../application/mappers/SeasonStatsMapper";
import { SeasonStatsPhase } from "../phases/SeasonStatsPhase";

@injectable()
export class SeasonStatsPhaseFactory {
    constructor(
        @inject(SeasonStatsMapper)
        private readonly seasonStatsMapper: SeasonStatsMapper,
    ) { }

    create(context: SyncContext): SeasonStatsPhase {
        return new SeasonStatsPhase(
            context,
            this.seasonStatsMapper
        );
    }
}