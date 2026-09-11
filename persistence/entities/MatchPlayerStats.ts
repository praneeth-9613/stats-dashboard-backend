import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { LeagueSeasonTeam } from "./LeagueSeasonTeam";
import { MatchPlayer } from "../../application/types/Matches";

@Entity("matchPlayerStats")
export class MatchPlayerStats {
    @PrimaryColumn({ type: "integer" })
    matchId!: number;

    @PrimaryColumn({ type: "integer" })
    leagueId!: number; 

    @PrimaryColumn({ type: "varchar" })
    season!: string;

    @PrimaryColumn({ type: "integer" })
    teamId!: number;

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