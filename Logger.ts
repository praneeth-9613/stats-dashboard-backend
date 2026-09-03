import { ScrapePhase } from "./application/types/Common";

export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
}

export interface LogContext {
    teamId?: number;
    season?: string;
    leagueId?: number;
    phase?: ScrapePhase;
    step?: string;
}

export class Logger {
    constructor(
        private readonly context: LogContext = {},
    ) { }

    child(context: LogContext): Logger {
        return new Logger({
            ...this.context,
            ...context,
        });
    }

    debug(message: string, data?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, data);
    }

    info(message: string, data?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, data);
    }

    warn(message: string, data?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, data);
    }

    error(
        message: string,
        error?: unknown,
        data?: Record<string, unknown>,
    ): void {
        this.log(
            LogLevel.ERROR,
            message,
            {
                ...data,
                error: error instanceof Error
                    ? {
                        message: error.message,
                        stack: error.stack,
                    }
                    : error,
            },
        );
    }

    private log(
        level: LogLevel,
        message: string,
        data?: Record<string, unknown>,
    ): void {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...this.context,
            ...data,
        };

        console.log(JSON.stringify(entry));
    }
}