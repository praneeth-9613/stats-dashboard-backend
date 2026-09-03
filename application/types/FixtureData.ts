export interface FixtureData {
    matchId: number;

    season: string;

    teamId: number;

    opponent: string;

    competition: string;

    homeAway: "home" | "away";

    completed: boolean;

    fixtureDate: string;

    homeScore: number | null;

    awayScore: number | null;

    scoreStr: string | null;

    isPenaltyShootout: boolean;

    notStarted: boolean;
}