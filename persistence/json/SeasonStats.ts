export interface SeasonStats {
    team: string;
    teamId: number;
    season: string;
    matchesProcessed: number;
    generatedAt?: string;
    players: SeasonPlayerStats[];
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