import {
    CreateDateColumn,
    PrimaryGeneratedColumn,
} from "typeorm";

export abstract class BaseAudit {
    @PrimaryGeneratedColumn()
    id!: number;

    @CreateDateColumn()
    createdAt!: Date;
}