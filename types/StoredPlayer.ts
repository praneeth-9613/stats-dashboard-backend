import { FotMobDate } from "./FotmobTypes";
import { InjuryInformation, PlayerInformation, PlayerPosition } from "./PlayerInformationTypes";

export interface StoredPlayerData {
    id: number;
    name: string;
    birthDate: FotMobDate | null;

    positions: PlayerPosition[];

    playerInformation: PlayerInformation;

    injuryInformation: InjuryInformation | null;

    contractEnd: string | null;
}

export type PlayersDatabase =
    Record<string, StoredPlayerData>;

export interface PlayersPhaseData {
    final: PlayersDatabase,
    cachedPlayerIds: Set<number>
}