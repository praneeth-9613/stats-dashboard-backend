import { MigrationInterface, QueryRunner } from "typeorm";

export class SquadSchema1787917736287 implements MigrationInterface {
    name = 'SquadSchema1787917736287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "squad" ("leagueId" integer NOT NULL, "season" character varying NOT NULL, "teamId" integer NOT NULL, "playerId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_100cdc2afe3eee1790d08cc187a" PRIMARY KEY ("leagueId", "season", "teamId", "playerId"))`);
        await queryRunner.query(`CREATE TYPE "public"."squadAudit_action_enum" AS ENUM('NEW', 'REMOVED')`);
        await queryRunner.query(`CREATE TABLE "squadAudit" ("id" SERIAL NOT NULL, "leagueId" integer NOT NULL, "season" character varying NOT NULL, "teamId" integer NOT NULL, "playerId" integer NOT NULL, "action" "public"."squadAudit_action_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0d25a7512647bdd1c2808f3d153" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "squadAudit"`);
        await queryRunner.query(`DROP TYPE "public"."squadAudit_action_enum"`);
        await queryRunner.query(`DROP TABLE "squad"`);
    }

}
