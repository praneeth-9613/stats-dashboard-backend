import { inject, injectable } from "tsyringe";
import {
    newScrapeStatus,
    RefreshScope,
    SyncType,
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

        const syncType = getArgValue("--syncType") as SyncType;
        const scope = getArgValue("--scope") as RefreshScope;

        const scrapeStatuses = {
            [teamId]: newScrapeStatus(),
        };

        await this.syncOrchestrator.run({
            teamId,
            teamName,
            season,
            leagueId,
            syncType,
            scope,
            scrapeStatuses,
        });
    }
}