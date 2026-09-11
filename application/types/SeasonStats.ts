import { LeagueSeasonTeamIdentifier } from "../../application/types/PhaseInput";

export interface SeasonStats {
    team: string;
    leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier;
    matchesProcessed: number;
    generatedAt?: string;
    players: Record<string, SeasonPlayerStats>;
}

export interface SeasonPlayerStats {
    playerId: number;
    name: string;
    appearances: number;
    ratingSum: number | null;
    ratingMatches: number | null;
    averageRating: number | null;
    stats: Record<string, SeasonStat>;
}

export interface SeasonStat {
    value?: number;
    total?: number;
    type?: string;
}