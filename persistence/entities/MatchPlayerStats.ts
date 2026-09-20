import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { LeagueSeasonTeam } from "./LeagueSeasonTeam";
import { MatchPlayer } from "../../application/types/Matches";

@Entity("matchPlayerStats")
export class MatchPlayerStats {
    @PrimaryColumn({ type: "integer" })
    matchId!: number;

    /**
 * League context this team belongs to.
 * This is not the competition of the match itself.
 */
    @PrimaryColumn({ type: "integer" })
    leagueId!: number;

    @PrimaryColumn({ type: "varchar" })
    season!: string;

    @PrimaryColumn({ type: "integer" })
    teamId!: number;

    @Column({ type: "integer", nullable: true })
    competitionId!: number | null;

    @Column({ type: "jsonb", nullable: true })
    data!: Record<string, MatchPlayer> | null;

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