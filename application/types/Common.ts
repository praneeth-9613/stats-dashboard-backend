import { Logger } from "../../Logger";
import { LeagueSeasonTeamIdentifier } from "./PhaseInput";

export type ScrapePhase =
    "squad"
    | "players"
    | "fixtures"
    | "match_processing"
    | "season_stats"
    | "academy_players";

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
    scrapeStatuses: Record<number, ScrapeStatus>;
}

export interface SyncContext {
    leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier,
    teamName: string;
    scrapeStatus: ScrapeStatus;
    logger?: Logger;
}

export interface ScrapeStepStatus {
    current: number;
    total: number;
    percent: number;
    message?: string;
    completed: boolean;
}