import { Column, Entity } from "typeorm";
import { BaseAudit } from "../BaseAudit";

@Entity("fixtureAudit")
export class FixtureAudit extends BaseAudit {
    @Column({ type: "integer" })
    matchId!: number;
}