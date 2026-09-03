import {
    Column
} from "typeorm";
import { BaseAudit } from "./BaseAudit";

export abstract class BasePlayerAudit extends BaseAudit {
    @Column({ type: "integer" })
    playerId!: number;
}