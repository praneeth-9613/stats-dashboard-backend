import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseAudit } from "../../BaseAudit";

export enum FixtureAuditAction {
    NEW = "NEW",
    MARKED_FOR_PROCESSING = "MARKED_FOR_PROCESSING",
    RESCHEDULED = "RESCHEDULED",
    PROCESSED = "PROCESSED",
}

@Entity("fixtureAudit")
export class FixtureAudit extends BaseAudit {
    @Column({ type: "varchar" })
    season!: string;

    @Column({ type: "integer" })
    teamId!: number;

    @Column({ type: "integer" })
    matchId!: number;

    @Column({
        type: "enum",
        enum: FixtureAuditAction,
    })
    action!: FixtureAuditAction;
}