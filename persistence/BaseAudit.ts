import {
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
} from "typeorm";

export abstract class BaseAudit {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    field!: string;

    @Column({ type: "jsonb", nullable: true })
    oldValue!: unknown;

    @Column({ type: "jsonb", nullable: true })
    newValue!: unknown;

    @CreateDateColumn()
    createdAt!: Date;
}