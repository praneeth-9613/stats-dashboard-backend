export type ScrapePhase =
    "squad"
    | "players"
    | "fixtures"
    | "match_processing"
    | "season_stats"
    | "academy_players";

export type SyncType = "sync" | "refresh";

export interface ScrapeStatus {
    running: boolean;

    phase: ScrapePhase | undefined;

    current: number;
    total: number;
    percent: number;
    message: string;


    steps: Partial<
        Record<ScrapePhase, Record<string, ScrapeStepStatus>>
    >;

    completed: Partial<Record<ScrapePhase, boolean>>;

    startedAt: number;
    completedAt: number;

    error?: string;
}

export function newScrapeStatus(): ScrapeStatus {
    return {
        running: true,
        phase: undefined,
        current: 0,
        total: 0,
        percent: 0,
        message: "",
        steps: {},
        completed: {},
        startedAt: Date.now(),
        completedAt: 0,
    };
}

export interface ScraperOptions {
    season: string;
    leagueId: number;
    teamId: number;
    teamName: string;
    syncType: SyncType;
    scope?: RefreshScope;
    scrapeStatuses: Record<number, ScrapeStatus>;
}

export type RefreshScope = "players" | "fixtures";

export interface SyncContext {
    season: string;
    leagueId: number;
    teamId: number;
    teamName: string;
    syncType?: SyncType;
    scope?: RefreshScope
    scrapeStatus: ScrapeStatus;
}

export interface ScrapeStepStatus {
    current: number;
    total: number;
    percent: number;
    message?: string;
    completed: boolean;
}