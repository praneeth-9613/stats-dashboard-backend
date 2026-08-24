export interface FixtureTeam {
    id: number;
    name: string;
    score: number;
}

export interface FixtureTournament {
    name: string;
    stage?: string;
    leagueId: number;
}

export interface FixtureStatus {
    utcTime: string;
    finished: boolean;
    started: boolean;
    cancelled: boolean;
    awarded?: boolean;
    scoreStr?: string;
    reason?: { long: string }
}

export interface Fixture {
    id: number;
    pageUrl: string;

    opponent: {
        id: number;
        name: string;
        score: number;
    };

    home: FixtureTeam;
    away: FixtureTeam;

    tournament: FixtureTournament;

    status: FixtureStatus;
}