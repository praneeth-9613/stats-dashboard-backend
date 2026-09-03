import { MatchStatSectionResponse } from "../../api/types/RawMatch";
import { InfoBoxStadiumResponse, PlayerOfTheMatchResponse } from "../../api/types/RawMatchFacts";
import { LeagueSeasonTeamIdentifier } from "../../application/types/PhaseInput";

export type MatchesPlayerStats = Record<string, MatchPlayerStats>

export type PlayerOfTheMatch = {
    id: number;
    name: string;
    teamName: string;
    rating: number;
};

export type Stadium = InfoBoxStadiumResponse;

export interface MatchPlayerStats {
    matchId: number;
    leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier;
    playerStats?: Record<string, MatchPlayer>;
}

export interface MatchPlayer {
    playerId: number;
    name: string;
    teamName: string;
    isGoalkeeper?: boolean;
    stats?: MatchStatSectionResponse[];
    shirtNumber?: string;
}

export type MatchesGoalscorers = Record<string, MatchGoalscorers>

export interface MatchGoalscorers {
    matchId: number;
    leagueSeasonTeamIdentifier: LeagueSeasonTeamIdentifier;
    goalscorers?: MatchHeaderEvents;
    playerOfTheMatch?: PlayerOfTheMatch | null;
}

export interface MatchHeaderEvents {
    home: GoalEvent[],
    away: GoalEvent[]
}

export interface GoalEvent {
    playerId: number;
    time: number;
    fullName: string;
    lastName: string;
    assistInput?: string | null;
    shotType: string;
    situation: string;
    isOwnGoal: boolean;
}