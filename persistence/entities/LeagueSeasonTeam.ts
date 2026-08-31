import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("leagueSeasonTeam")
export class LeagueSeasonTeam {
    @PrimaryColumn({ type: 'integer' })
    teamId!: number;

    @PrimaryColumn(({ type: 'integer' }))
    leagueId!: number;

    @PrimaryColumn(({ type: 'varchar' }))
    season!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}