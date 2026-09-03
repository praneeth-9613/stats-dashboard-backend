import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BasePlayerAudit } from "../BasePlayerAudit";

@Entity("playerAudit")
export class PlayerAudit extends BasePlayerAudit { }