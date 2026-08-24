export interface PlayerInformationValue {
    numberValue?: number;
    dateValue?: string;
    key: string | null;
    fallback: string | number | {
        utcTime: string;
        timezone: string | null;
    };
    options?: {
        style?: string;
        unit?: string;
        unitDisplay?: string;
    };
}

export interface PlayerInformation {
    age: string | null;
    country: string | null;
    height: string | null;
    preferred_foot: string | null;
    transfer_value: string | null;
    shirt: number | null;
}

export const PLAYER_INFORMATION_KEYS = [
    "age",
    "country",
    "height",
    "preferred_foot",
    "transfer_value",
    "shirt",
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
    "Shirt": "shirt",
};

export interface InjuryInformation {
    name: string;
    key: string;
    expectedReturn: string | null;
    lastUpdated: {
        utcTime: string;
        timezone: string | null;
    };
}

export type PlayerPosition = { label: string, key: string, isMainPosition: boolean };