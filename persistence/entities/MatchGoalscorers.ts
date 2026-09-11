import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { LeagueSeasonTeam } from "./LeagueSeasonTeam";
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
    teamId!: number;

    @Column({ type: "jsonb", nullable: true })
    data!: MatchHeaderEvents | null;

    @Column({ type: "jsonb", nullable: true })
    potm!: PlayerOfTheMatch | null;

    @ManyToOne(() => LeagueSeasonTeam, {
        onDelete: "CASCADE",
    })
    @JoinColumn([
        { name: "leagueId", referencedColumnName: "leagueId" },
        { name: "season", referencedColumnName: "season" },
        { name: "teamId", referencedColumnName: "teamId" },
    ])
    leagueSeasonTeam?: LeagueSeasonTeam;
}