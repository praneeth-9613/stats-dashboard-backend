import { TeamStatus } from "../../persistence/entities/PlayerTeam";

export interface PlayerData {
    profile: PlayerProfile,
    positions: {
        class?: PositionClass,
        list: PlayerPositionData[]
    },
    injury: PlayerInjuryInformation | null,
    team: PlayerTeamData | null
}

export interface PlayerInformation {
    age?: string | null;
    country?: string | null;
    height?: string | null;
    preferred_foot?: string | null;
    transfer_value?: string | null;
}

export interface PlayerProfile extends PlayerInformation {
    id: number;
    name: string;

    birthDate: string | null;
    gender: string;
}

export const PLAYER_INFORMATION_KEYS = [
    "age",
    "country",
    "height",
    "preferred_foot",
    "transfer_value"
    
] as const;

export type PlayerInformationKey =
    typeof PLAYER_INFORMATION_KEYS[number];

export const PLAYER_INFORMATION_MAP: Record<
    string,
    PlayerInformationKey
> = {
    "Age": "age",
    "Country": "country",
    "Height": "height",
    "Preferred foot": "preferred_foot",
    "Market value": "transfer_value",
};

export type PositionClass = "Keepers" | "Defenders" | "Midfielders" | "Attackers";

export type PlayerPositionData = { label: string, key: string, isMainPosition: boolean };

export interface PlayerInjuryInformation {
    name: string;
    key: string;
    expectedReturn: string | null;
    lastUpdated: string | null;
}

export interface PlayerTeamData {
    teamId: number;
    teamName: string;
    shirt?: number | null;
    onLoan: boolean;
    isCaptain: boolean;
    teamStatus?: TeamStatus;
    contractEnd: string | null;
}
