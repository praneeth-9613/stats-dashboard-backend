import { FotMobPlayer } from "./FotmobTypes";

export interface PlayerOfTheMatch {
    id: number;
    name: { fullName: string };
    teamName: string;
    rating: { num: string };
}

export interface InfoBox {
    Stadium: InfoBoxStadium;
}

export interface InfoBoxStadium {
    name: string;
    city: string;
    country: string;
}

export interface MatchFacts {
    playerOfTheMatch?: PlayerOfTheMatch;
    infoBox?: InfoBox;
}

export interface MatchHeader {
    events?: MatchHeaderEvents
}

export interface ShotmapEvent {
    shotType: string;
    situation: string;
    isOwnGoal: boolean;
}

export interface GoalEvent {
    playerId: number;
    time: number;
    fullName: string;
    lastName: string;
    assistInput?: string | null;
    shotmapEvent?: ShotmapEvent | null;
}

export interface MatchHeaderEvents {
    homeTeamGoals: Record<string, GoalEvent[]>,
    awayTeamGoals: Record<string, GoalEvent[]>
}

export interface MatchDetailsResponse {
    content?: {
        playerStats?: Record<string, FotMobPlayer>;
        matchFacts?: MatchFacts;
    };
    header?: MatchHeader;
}