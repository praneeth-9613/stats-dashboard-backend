import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity("league")
export class League {
    @PrimaryColumn({ type: 'integer' })
    leagueId!: number;

    @Column(({ type: 'varchar' }))
    name!: string;

    @CreateDateColumn()
    createdAt!: Date;
}