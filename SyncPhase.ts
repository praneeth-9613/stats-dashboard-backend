import { completePhase, startPhase } from "./helper";
import { ScrapePhase, SyncContext } from "./types/Common";

export abstract class SyncPhase {
    constructor(
        protected readonly context: SyncContext
    ) { }

    protected async execute<T>(
        phase: ScrapePhase,
        total: number,
        message: string,
        work: () => Promise<T>
    ): Promise<T> {

        const { scrapeStatus } = this.context;

        startPhase(
            scrapeStatus,
            phase,
            total,
            message
        );

        try {
            const result = await work();

            completePhase(
                scrapeStatus,
                phase
            );

            return result;
        } catch (error) {
            throw error;
        }
    }
}