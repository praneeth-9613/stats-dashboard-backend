import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from "typeorm";
import { Team } from "./Team";

@Entity("reserveTeam")
export class ReserveTeam {
    @PrimaryColumn({ type: "integer" })
    parentTeamId!: number;

    @PrimaryColumn({ type: "integer" })
    teamId!: number;

    @Column({ type: "varchar" })
    teamName!: string;

    @ManyToOne(() => Team, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({
        name: "parentTeamId",
        referencedColumnName: "teamId",
    })
    parentTeam!: Team;
}