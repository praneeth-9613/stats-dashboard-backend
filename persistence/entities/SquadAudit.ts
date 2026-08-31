import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";

export enum SquadAuditAction {
    NEW = "NEW",
    REMOVED = "REMOVED",
}

@Entity("squadAudit")
export class SquadAudit {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "integer" })
    leagueId!: number;

    @Column({ type: "varchar" })
    season!: string;

    @Column({ type: "integer" })
    teamId!: number;

    @Column({ type: "integer" })
    playerId!: number;

    @Column({
        type: "enum",
        enum: SquadAuditAction,
    })
    action!: SquadAuditAction;

    @CreateDateColumn()
    createdAt!: Date;
}