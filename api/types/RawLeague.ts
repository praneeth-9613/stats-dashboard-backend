export interface LeagueResponse {
    table: {
        data: {
            table: {
                all: LeagueTableTeam[]
            }
        }
    }[],
    details: {
        name: string
    }
}

export interface LeagueTableTeam {
    name: string;
    id: number;
}