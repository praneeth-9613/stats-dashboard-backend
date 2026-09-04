import { inject, injectable } from "tsyringe";
import {
    newScrapeStatus
} from "./application/types/Common";

import { getArgValue } from "./helper";
import { SyncOrchestrator } from "./SyncOrchestrator";

@injectable()
export class Scraper {
    constructor(
        @inject(SyncOrchestrator)
        private readonly syncOrchestrator: SyncOrchestrator,
    ) { }

    async run(): Promise<void> {
        const teamId = Number(getArgValue("--teamId") || 0);
        const teamName = getArgValue("--teamName") || "";
        const season = getArgValue("--season") || "2026-2027";
        const leagueId = Number(getArgValue("--leagueId") || 0);

        const scrapeStatuses = {
            [teamId]: newScrapeStatus(),
        };

        await this.syncOrchestrator.run({
            teamId,
            teamName,
            season,
            leagueId,
            scrapeStatuses,
        });
    }
}