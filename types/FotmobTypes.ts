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