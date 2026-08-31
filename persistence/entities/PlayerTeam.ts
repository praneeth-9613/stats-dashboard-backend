import {
    Column,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";

export enum TeamStatus {
    TRANSFERRED_OUT = "TRANSFERRED_OUT",
    FREE_AGENT = "FREE_AGENT",
    NOT_IN_SQUAD = "NOT_IN_SQUAD",
    UNKNOWN = "UNKNOWN",
}

@Entity("playerTeam")
export class PlayerTeam {
    @PrimaryColumn({ type: "varchar" })
    season!: string;

    @PrimaryColumn({ type: "integer" })
    playerId!: number;

    @PrimaryColumn({ type: "integer" })
    teamId!: number;

    @Column({ type: "integer", nullable: true })
    shirtNumber!: number | null;

    @Column({ type: "varchar", nullable: true })
    contractEnd!: string | null;

    @Column({ type: "boolean" })
    isCaptain!: boolean;

    @Column({
        type: "enum",
        enum: TeamStatus,
        default: TeamStatus.UNKNOWN,
    })
    teamStatus!: TeamStatus;

    @UpdateDateColumn()
    updatedAt!: Date;
}