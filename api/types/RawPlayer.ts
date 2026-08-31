export interface PlayerResponse {
    id: number;
    name: string;

    birthDate?: {
        utcTime: string;
        timezone: string | null;
    } | null;

    contractEnd?: {
        utcTime: string;
        timezone: string | null;
    } | null;

    isCoach: boolean;
    isCaptain: boolean;
    gender: string;

    primaryTeam: {
        teamId: number;
        teamName: string;
        onLoan: boolean;
        teamColors: {
            color: string;
            colorAlternate: string;
            colorAway: string;
            colorAwayAlternate: string;
        };
    };

    positionDescription: {
        positions: FotMobPlayerPosition[];

        primaryPosition: {
            label: string;
            key: string;
        };

        nonPrimaryPositions: {
            label: string;
            key: string;
        }[];
    };

    injuryInformation: PlayerInjuryInformationResponse | null;

    internationalDuty: unknown | null;

    playerInformation: PlayerInformationResponse[];

    mainLeague: unknown;

    trophies: unknown;

    recentMatches: unknown[];
}

export interface FotMobPlayerPosition {
    strPos: {
        label: string;
        key: string;
    };

    strPosShort: {
        label: string;
        key: string;
    };

    occurences: number;
    position: string;
    isMainPosition: boolean;

    pitchPositionData: {
        right: number;
        top: number;
        ratio?: number;
    };
}

export interface PlayerInformationResponse {
    value: {
        numberValue?: number;
        dateValue?: string;
        key: string | null;
        fallback: string | number | object;

        options?: Record<string, unknown>;
    };

    title: string;
    translationKey: string;

    icon?: {
        type: string;
        id: string;
    };

    countryCode?: string;
}



export interface PlayerInjuryInformationResponse {
    name: string;
    key: string;

    expectedReturn: {
        expectedReturnKey: string;
        expectedReturnDateParam: string;
        expectedReturnFallback: string;
    } | null;

    lastUpdated: {
        utcTime: string;
        timezone: string | null;
    };
}
