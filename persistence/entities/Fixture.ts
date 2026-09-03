import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";
import { LeagueSeasonTeam } from "./LeagueSeasonTeam";

export enum FixtureStatus {
    NEW = "NEW",
    MARKED_FOR_PROCESSING = "MARKED_FOR_PROCESSING",
    RESCHEDULED = "RESCHEDULED",
    PROCESSED = "PROCESSED",
}

@Entity("fixture")
export class Fixture {
    @PrimaryColumn({ type: "integer" })
    matchId!: number;

    @Column({ type: "varchar" })
    season!: string;

    @Column({ type: "integer" })
    leagueId!: number;

    @Column({ type: "integer" })
    teamId!: number;

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

    @Column({ type: "integer" })
    homeId!: number;

    @Column({ type: "integer" })
    awayId!: number;

    @Column({ type: "varchar" })
    homeName!: string;

    @Column({ type: "varchar" })
    awayName!: string;

    @Column({ type: "integer", nullable: true })
    homeScore!: number | null;

    @Column({ type: "integer", nullable: true })
    awayScore!: number | null;

    @Column({ type: "varchar", nullable: true })
    scoreStr!: string | null;

    @Column({ type: "boolean", default: false })
    isPenaltyShootout!: boolean;

    @Column({
        type: "enum",
        enum: FixtureStatus,
    })
    fixtureStatus!: FixtureStatus;

    @Column({ type: "varchar", nullable: true })
    stadiumName!: string | null;

    @Column({ type: "varchar", nullable: true })
    stadiumCity!: string | null;

    @Column({ type: "varchar", nullable: true })
    stadiumCountry!: string | null;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => LeagueSeasonTeam, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn([
        { name: "teamId", referencedColumnName: "teamId" },
        { name: "leagueId", referencedColumnName: "leagueId" },
        { name: "season", referencedColumnName: "season" },
    ])
    leagueSeasonTeam!: LeagueSeasonTeam;
}