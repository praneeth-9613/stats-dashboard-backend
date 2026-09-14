import { Column, Entity, PrimaryColumn } from "typeorm";
import { MatchHeaderEvents, PlayerOfTheMatch } from "../../application/types/Matches";

@Entity("matchGoalscorers")
export class MatchGoalscorers {
    @PrimaryColumn({ type: "integer" })
    matchId!: number;

    @PrimaryColumn({ type: "integer" })
    leagueId!: number;

    @PrimaryColumn({ type: "varchar" })
    season!: string;

    @PrimaryColumn({ type: "integer" })
    homeId!: number;

    @PrimaryColumn({ type: "integer" })
    awayId!: number;

    @Column({ type: "jsonb", nullable: true })
    data!: MatchHeaderEvents | null;

    @Column({ type: "jsonb", nullable: true })
    potm!: PlayerOfTheMatch | null;
}