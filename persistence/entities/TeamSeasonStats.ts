import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { LeagueSeasonTeam } from "./LeagueSeasonTeam";
import { SeasonPlayerStats } from "../../application/types/SeasonStats";

@Entity("teamSeasonStats")
export class TeamSeasonStats {
    @PrimaryColumn({ type: "integer" })
    leagueId!: number;

    @PrimaryColumn({ type: "varchar" })
    season!: string;

    @PrimaryColumn({ type: "integer" })
    teamId!: number;

    @Column({ type: "jsonb" })
    data!: Record<string, SeasonPlayerStats>;

    @Column({ type: "integer" })
    matchesProcessed!: number;

    @Column({ type: "varchar" })
    generatedAt!: string | null;

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