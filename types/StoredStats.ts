import { FixtureTeam } from "./FixtureTypes";
import { InfoBoxStadium } from "./MatchDetails";

export interface StoredStat {
    value: number;
    total?: number;
}

export interface StoredPlayerStats {
    id: number;
    name: string;
    isGoalkeeper: boolean;
    stats: Record<string, StoredStat>;
    appearances?: number;
    ratingSum?: number;
    ratingMatches?: number;
    averageRating?: number | null;
}

export interface StoredPOM {
    id: number;
    name: string,
    teamName: string,
    rating: number | null
}

export interface StoredGoalEvent {
    playerId: number;
    time: number;
    fullName: string;
    lastName: string;
    assistInput?: string | null;
    shotType: string | null;
    situation: string | null;
    isOwnGoal: boolean;
}

export interface StoredGoalscorers {
    home: StoredGoalEvent[],
    away: StoredGoalEvent[]
}

export type StoredStadium = InfoBoxStadium;

export interface StoredMatch {
    matchId: number;
    date: string | null;
    competition: string | null;
    tournamentId: number | null;

    opponent: {
        id: number | null;
        name: string | null;
    };

    home: FixtureTeam | null;
    away: FixtureTeam | null;

    score: string | null;

    scoreIncludesPenaltyShootout: boolean;

    players: Record<string, StoredPlayerStats>;

    playerOfTheMatch: StoredPOM | null;

    stadium: StoredStadium | null;

    finalStatus: string | null;

    goalscorers: StoredGoalscorers | null;

    isCompleted: boolean;

}

export type MatchesDatabase = Record<string, StoredMatch>;
