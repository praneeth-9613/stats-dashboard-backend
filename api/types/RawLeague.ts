export interface LeagueResponse {
    table: {
        data: {
            table: {
                all: LeagueTableTeam[]
            }
        }
    }[]
}

export interface LeagueTableTeam {
    name: string;
    id: number;
}