export interface FotMobStat {
    value?: number;
    total?: number;
    type?: string;
}

export interface FotMobStatWrapper {
    key: string | null;
    stat: FotMobStat;
}

export interface FotMobStatSection {
    title: string;
    key: string;
    stats: Record<string, FotMobStatWrapper>;
}

export interface FotmobPlayerInjuryInformation {
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

export interface FotMobPlayer {
    name: string;
    id: number;
    optaId?: string;
    teamId: number;
    teamName: string;
    isGoalkeeper?: boolean;
    stats?: FotMobStatSection[];
    shirtNumber?: string;
    positionId?: number;
    usualPosition?: number;
}

export interface FotMobDate {
    utcTime: string;
    timezone: string | null;
}

export interface FotMobPlayerResponse {
    id: number;
    name: string;

    birthDate: {
        utcTime: string;
        timezone: string | null;
    };

    contractEnd: {
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

    injuryInformation: FotmobPlayerInjuryInformation | null;

    internationalDuty: unknown | null;

    playerInformation: FotMobPlayerInformation[];

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

export interface FotMobPlayerInformation {
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