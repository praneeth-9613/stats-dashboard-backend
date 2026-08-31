export type ScrapePhase =
    "squad"
    | "players"
    | "fixtures"
    | "season_stats"
    | "academy_players";

export interface ScrapeStatus {
    running: boolean;

    phase?: ScrapePhase;

    current?: number;
    total?: number;

    percent?: number;

    message?: string;

    completed?: {
        players: boolean;
        fixtures: boolean;
        season_stats: boolean;
        academy_players: boolean;
    };

    startedAt?: number;
    completedAt?: number;

    error?: string;
}

export interface ScraperOptions {
    leagueId: number;
    season: string;
    refresh?: boolean;
    scope?: RefreshScope
    playerIds?: number[];
    matchIds?: number[];
    teamId: number;
    teamName: string;
    scrapeStatuses?: Record<number, ScrapeStatus>
}

export type RefreshScope = "all" | "players" | "fixtures";

export interface SyncContext {
    teamId: number;
    teamName: string;
    leagueId: number;
    season: string;
    refresh: boolean;
    scope: RefreshScope;
    scrapeStatus: ScrapeStatus;
}

export interface Persist {
    updatedAt: string
}