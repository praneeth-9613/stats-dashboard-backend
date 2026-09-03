import { CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Team } from "./Team";
import { League } from "./League";
import { Fixture } from "./Fixture";

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

    @ManyToOne(() => League, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({
        name: "leagueId",
        referencedColumnName: "leagueId",
    })
    league!: League;

    @ManyToOne(() => Team, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({
        name: "teamId",
        referencedColumnName: "teamId",
    })
    team!: Team;

    @OneToMany(() => Fixture, fixture => fixture.leagueSeasonTeam)
    fixtures!: Fixture[];
}