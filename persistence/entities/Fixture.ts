import {
    Column,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("fixture")
export class Fixture {
    @PrimaryColumn({ type: "integer" })
    matchId!: number;

    @Column({ type: "varchar" })
    season!: string;

    @Column({ type: "integer" })
    teamId!: number;

    @Column({ type: "varchar" })
    opponent!: string;

    @Column({ type: "varchar" })
    competition!: string;

    @Column({ type: "varchar" })
    homeAway!: string;

    @Column({ type: "boolean" })
    completed!: boolean;

    @Column({ type: "boolean" })
    notStarted!: boolean;

    @Column({ type: "timestamp" })
    fixtureDate!: Date;

    @Column({ type: "integer", nullable: true })
    homeScore!: number | null;

    @Column({ type: "integer", nullable: true })
    awayScore!: number | null;

    @Column({ type: "varchar", nullable: true })
    scoreStr!: string | null;

    @Column({ type: "boolean", default: false })
    isPenaltyShootout!: boolean;

    @UpdateDateColumn()
    updatedAt!: Date;
}