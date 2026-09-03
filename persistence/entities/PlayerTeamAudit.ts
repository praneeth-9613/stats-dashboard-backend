import { Column, Entity } from "typeorm";
import { BasePlayerAudit } from "../BasePlayerAudit";

@Entity("playerTeamAudit")
export class PlayerTeamAudit extends BasePlayerAudit {
    @Column({ type: "varchar" })
    season!: string;

    @Column({ type: "integer" })
    teamId!: number;
}