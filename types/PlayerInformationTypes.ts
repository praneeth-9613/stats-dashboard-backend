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