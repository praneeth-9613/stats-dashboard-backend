export type ScrapePhase =
    "players"
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
    resync?: boolean;
    playerIds?: number[];
    matchIds?: number[];
    teamId: number;
    teamName: string;
    scrapeStatuses?: Record<number, ScrapeStatus>
}