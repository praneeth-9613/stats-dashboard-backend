export interface ShotmapEventResponse {
    shotType: string;
    situation: string;
    isOwnGoal: boolean;
}

export interface GoalEventResponse {
    playerId: number;
    time: number;
    fullName: string;
    lastName: string;
    assistInput?: string | null;
    shotmapEvent?: ShotmapEventResponse | null;
}

export interface MatchHeaderEventsResponse {
    homeTeamGoals: Record<string, GoalEventResponse[]>,
    awayTeamGoals: Record<string, GoalEventResponse[]>
}

export interface MatchHeaderResponse {
    events?: MatchHeaderEventsResponse
}