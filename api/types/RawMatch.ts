import { MatchFactsResponse } from "./RawMatchFacts";
import { MatchHeaderResponse } from "./RawMatchHeader";

export interface MatchStatResponse {
    value?: number;
    total?: number;
    type?: string;
}

export interface MatchStatWrapperResponse {
    key: string | null;
    stat: MatchStatResponse;
}

export interface MatchStatSectionResponse {
    title: string;
    key: string;
    stats: Record<string, MatchStatWrapperResponse>;
}

export interface MatchPlayerResponse {
    name: string;
    id: number;
    optaId?: string;
    teamId: number;
    teamName: string;
    isGoalkeeper?: boolean;
    stats?: MatchStatSectionResponse[];
    shirtNumber?: string;
    positionId?: number;
    usualPosition?: number;
}

export interface MatchResponse {
    content?: {
        playerStats?: Record<string, MatchPlayerResponse>;
        matchFacts?: MatchFactsResponse;
    };
    header?: MatchHeaderResponse;
}