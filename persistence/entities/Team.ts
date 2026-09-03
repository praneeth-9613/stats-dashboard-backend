import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";


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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}