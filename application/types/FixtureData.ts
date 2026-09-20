export interface FixtureData {
    matchId: number;

    season: string;

    leagueId: number;

    teamId: number;

    competition: string;

    competitionId: number;

    competitionStage: string | null;

    homeAway: "home" | "away";

    completed: boolean;

    cancelled: boolean;

    fixtureDate: string;

    homeId: number;

    awayId: number;

    homeName: string;

    awayName: string;

    homeScore: number | null;

    awayScore: number | null;

    scoreStr: string | null;

    isPenaltyShootout: boolean;

    notStarted: boolean;
}