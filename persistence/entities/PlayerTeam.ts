import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";
import { Player } from "./Player";
import { LeagueSeasonTeam } from "./LeagueSeasonTeam";

export enum TeamStatus {
    TRANSFERRED_OUT = "TRANSFERRED_OUT",
    FREE_AGENT = "FREE_AGENT",
    NOT_IN_SQUAD = "NOT_IN_SQUAD",
    UNKNOWN = "UNKNOWN",
}

@Entity("playerTeam")
export class PlayerTeam {
    @PrimaryColumn({ type: "integer" })
    playerId!: number;

    @PrimaryColumn({ type: "varchar" })
    season!: string;

    @PrimaryColumn({ type: "integer" })
    leagueId!: number;

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

    @ManyToOne(() => Player, player => player.playerTeams)
    @JoinColumn({
        name: "playerId",
        referencedColumnName: "playerId",
    })
    player!: Player;

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