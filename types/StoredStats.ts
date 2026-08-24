import { FixtureTeam } from "./FixtureTypes";
import { GoalEvent, InfoBoxStadium } from "./MatchDetails";

export interface StoredStat {
    value: number;
    total?: number;
}

export interface StoredPlayer {
    id: number;
    name: string;
    shirtNumber: string | null;
    isGoalkeeper: boolean;
    positionId: number | null;
    usualPosition: number | null;
    stats: Record<string, StoredStat>;
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

    players: Record<string, StoredPlayer>;

    playerOfTheMatch: StoredPOM | null;

    stadium: StoredStadium | null;

    finalStatus: string | null;

    goalscorers: StoredGoalscorers | null;
    
    isCompleted: boolean;

}

export type MatchesDatabase = Record<string, StoredMatch>;
