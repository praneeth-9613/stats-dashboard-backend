import {
    Column,
    Entity,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";
import { PlayerInjuryInformation, PlayerPositionData } from "../../application/types/PlayerData";
import { PlayerTeam } from "./PlayerTeam";

@Entity("player")
export class Player {
    @PrimaryColumn({ type: "integer" })
    playerId!: number;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", nullable: true })
    country!: string | null;

    @Column({ type: "varchar", nullable: true })
    height!: string | null;

    @Column({ type: "varchar", nullable: true })
    transferValue!: string | null;

    @Column({ type: "varchar", nullable: true })
    preferredFoot!: string | null;

    @Column({ type: "integer", nullable: true })
    age!: number | null;

    @Column({ type: "jsonb", nullable: true })
    positions!: PlayerPositionData[] | null;

    @Column({ type: "jsonb", nullable: true })
    injury!: PlayerInjuryInformation | null;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => PlayerTeam, playerTeam => playerTeam.player)
    playerTeams!: PlayerTeam[];
}