import { ScrapePhase, ScrapeStatus, SyncContext } from "../application/types/Common";
import { sleep } from "../helper";

export abstract class SyncPhase<TStep extends string> {

    protected abstract readonly steps: readonly TStep[];

    constructor(
        protected readonly context: SyncContext
    ) { }

    protected async execute<T>(
        phase: ScrapePhase,
        total: number,
        message: string,
        work: () => Promise<T>
    ): Promise<T> {
        this.context.logger?.info(`Starting phase ${phase}`);
        this.startPhase(
            phase,
            total,
            message
        );

        this.context.logger?.info(`${message} `);

        try {
            const result = await work();

            await sleep(1500);

            this.context.logger?.info(`Completing phase ${phase}`);
            this.completePhase(
                phase
            );

            return result;
        } catch (error) {
            throw error;
        }
    }


    protected async executeStep(
        step: TStep,
        total: number,
        message: string,
        work: () => Promise<void>,
    ): Promise<void> {
        this.context.logger?.info(`Starting step ${step} `);
        this.startStep(
            step,
            total,
            message,
        );
        this.context.logger?.info(`${message} `);

        if (total === 0) {
            this.context.logger?.info(`Completing step ${step} `);
            this.updateEmptyStep(
                step,
            );

            return;
        }

        await work();

        await sleep(1500);

        this.context.logger?.info(`Completing step ${step} `);
        this.completeStep(
            step,
        );

    }

    startPhase(
        phase: ScrapePhase,
        total: number,
        message: string
    ): void {
        const { scrapeStatus } = this.context

        scrapeStatus.phase = phase;

        scrapeStatus.current = 0;
        scrapeStatus.total = total;
        scrapeStatus.percent = 0;
        scrapeStatus.message = message;

        // Reset steps for the new phase
        scrapeStatus.steps[phase] = Object.fromEntries(
            this.steps.map(step => [
                step,
                {
                    current: 0,
                    percent: 0,
                    total: 0,
                    completed: false,
                },
            ]),
        );

        scrapeStatus.startedAt = Date.now();
    }

    completePhase(
        phase: ScrapePhase,
    ): void {
        const { scrapeStatus } = this.context

        scrapeStatus.current = scrapeStatus.total;
        scrapeStatus.percent = 100;

        if (scrapeStatus.completed) {
            scrapeStatus.completed[phase] = true;
        }
    }

    startStep(
        step: TStep,
        total: number,
        message: string,
    ): void {
        const { scrapeStatus } = this.context;

        const currentPhase = scrapeStatus.phase;

        if (!currentPhase) {
            return;
        }

        const stepStatus = scrapeStatus.steps[currentPhase]?.[step];

        if (!stepStatus) {
            return;
        }

        stepStatus.current = 0;
        stepStatus.total = total;
        stepStatus.percent = 0;
        stepStatus.message = message;
        stepStatus.completed = false;
    }

    updateStep(
        status: ScrapeStatus,
        step: TStep,
        stepCurrent: number,
        stepMessage?: string,
    ): void {
        const { scrapeStatus } = this.context;

        const currentPhase = scrapeStatus.phase;

        if (!currentPhase) {
            return;
        }

        const currentPhaseSteps = scrapeStatus.steps[currentPhase];

        if (!currentPhaseSteps) {
            return;
        }

        const stepStatus = currentPhaseSteps[step];

        if (!stepStatus) {
            return;
        }

        stepStatus.current = stepCurrent;
        stepStatus.percent = stepStatus.total > 0
            ? Math.round(
                (stepCurrent / stepStatus.total) * 100,
            )
            : 100;

        stepStatus.message = stepMessage;

        scrapeStatus.current = Object.values(currentPhaseSteps)
            .reduce(
                (sum, step) => sum + step.current,
                0,
            );

        if (scrapeStatus.total !== undefined && scrapeStatus.total > 0) {
            scrapeStatus.percent = Math.round(
                (scrapeStatus.current / scrapeStatus.total) * 100,
            );
        }
    }

    updateEmptyStep(
        step: TStep,
    ): void {
        const { scrapeStatus } = this.context;

        const currentPhase = scrapeStatus.phase;

        if (!currentPhase) {
            return;
        }

        const stepStatus = scrapeStatus.steps[currentPhase]?.[step];

        if (!stepStatus) {
            return;
        }

        stepStatus.current = 0;
        stepStatus.percent = 100;
        stepStatus.completed = true;
    }

    completeStep(
        step: TStep,
    ): void {
        const { scrapeStatus } = this.context;

        const currentPhase = scrapeStatus.phase;

        if (!currentPhase) {
            return;
        }

        const stepStatus = scrapeStatus.steps[currentPhase]?.[step];

        if (!stepStatus) {
            return;
        }

        stepStatus.current = stepStatus.total;
        stepStatus.percent = 100;
        stepStatus.completed = true;
    }
}