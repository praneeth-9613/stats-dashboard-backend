import { ReserveTeam } from "../../persistence/entities/ReserveTeam";

export interface TeamData {
    id: number;

    name: string;

    primaryColor?: string;

    secondaryColor?: string;
}

export interface UpdateTeamPayload {
    primaryColor?: string | null;
    secondaryColor?: string | null;
    gradientAngle?: number | null;
    gradientStops?: TeamGradientStop[];
    reserveTeams?: ReserveTeam[];
}

export interface TeamGradientStop {
    color: string;
    position: number;
}