import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ReserveTeam } from "./ReserveTeam";
import { TeamGradientStop } from "../../application/types/TeamData";


@Entity("team")
export class Team {
    @PrimaryColumn({ type: 'integer' })
    teamId!: number;

    @Column(({ type: 'varchar' }))
    name!: string;

    @Column({ nullable: true, type: 'varchar' })
    primaryColor!: string | null;

    @Column({ nullable: true, type: 'varchar' })
    secondaryColor!: string | null;

    @Column({ type: "integer", default: 180 })
    gradientAngle!: number | null;

    @Column({ type: "jsonb", default: [] })
    gradientStops!: TeamGradientStop[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => ReserveTeam, reserveTeam => reserveTeam.parentTeam)
    reserveTeams!: ReserveTeam[];
}