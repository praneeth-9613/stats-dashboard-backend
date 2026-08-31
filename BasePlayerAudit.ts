import {
    Column
} from "typeorm";
import { BaseAudit } from "./BaseAudit";

export abstract class BasePlayerAudit extends BaseAudit {
    @Column({ type: "integer" })
    playerId!: number;

    @Column({ type: "varchar" })
    field!: string;

    @Column({ type: "jsonb", nullable: true })
    oldValue!: unknown;

    @Column({ type: "jsonb", nullable: true })
    newValue!: unknown;
}