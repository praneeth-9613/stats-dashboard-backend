import { ReserveTeam } from "../../persistence/entities/ReserveTeam";

export interface TeamData {
    id: number;

    name: string;

    primaryColor?: string;

    secondaryColor?: string;

    kitPrimaryColor?: string;
    kitSecondaryColor?: string;
}

export interface UpdateTeamPayload {
    primaryColor?: string | null;
    secondaryColor?: string | null;
    kitPrimaryColor?: string | null;
    kitSecondaryColor?: string | null;
    gradientAngle?: number | null;
    gradientStops?: TeamGradientStop[];
    reserveTeams?: ReserveTeam[];
}

export interface TeamGradientStop {
    color: string;
    position: number;
}

export interface TeamColors {
    primaryColor?: string;
    secondaryColor?: string;
    kitPrimaryColor?: string;
    kitSecondaryColor?: string;
}