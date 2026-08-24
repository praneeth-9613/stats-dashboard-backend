export interface ScrapeStatus {
    running: boolean;
    success: boolean | null;
    error: string | null;
}

export interface ScraperOptions {
    resync?: boolean;
    playerIds?: number[];
    matchIds?: number[];
    teamId: number;
    teamName: string;
}