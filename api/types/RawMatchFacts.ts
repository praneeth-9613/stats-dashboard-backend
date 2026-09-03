export interface PlayerOfTheMatchResponse {
    id: number;
    name: { fullName: string };
    teamName: string;
    rating: { num: string };
}

export interface InfoBoxStadiumResponse {
    name: string;
    city: string;
    country: string;
}

export interface InfoBoxResponse {
    Stadium: InfoBoxStadiumResponse;
}

export interface MatchFactsResponse {
    playerOfTheMatch?: PlayerOfTheMatchResponse;
    infoBox?: InfoBoxResponse;
}