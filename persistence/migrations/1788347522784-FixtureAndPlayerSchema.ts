import { MigrationInterface, QueryRunner } from "typeorm";

export class FixtureAndPlayerSchema1788347522784 implements MigrationInterface {
    name = 'FixtureAndPlayerSchema1788347522784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."fixture_fixturestatus_enum" AS ENUM('NEW', 'MARKED_FOR_PROCESSING', 'RESCHEDULED', 'PROCESSED')`);
        await queryRunner.query(`CREATE TABLE "fixture" ("matchId" integer NOT NULL, "season" character varying NOT NULL, "teamId" integer NOT NULL, "opponent" character varying NOT NULL, "competition" character varying NOT NULL, "homeAway" character varying NOT NULL, "completed" boolean NOT NULL, "notStarted" boolean NOT NULL, "fixtureDate" TIMESTAMP NOT NULL, "homeScore" integer, "awayScore" integer, "scoreStr" character varying, "isPenaltyShootout" boolean NOT NULL DEFAULT false, "fixtureStatus" "public"."fixture_fixturestatus_enum" NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5488946ee5eef68e2c4864ba1f6" PRIMARY KEY ("matchId"))`);
        await queryRunner.query(`CREATE TABLE "fixtureAudit" ("id" SERIAL NOT NULL, "field" character varying NOT NULL, "oldValue" jsonb, "newValue" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "matchId" integer NOT NULL, CONSTRAINT "PK_6d2973158e144d1dd3c7a06ac3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "player" ("playerId" integer NOT NULL, "country" character varying, "height" character varying, "transferValue" character varying, "preferredFoot" character varying, "age" integer, "positions" jsonb, "injury" jsonb, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee365af3f201a00d9a917bc45b0" PRIMARY KEY ("playerId"))`);
        await queryRunner.query(`CREATE TABLE "playerAudit" ("id" SERIAL NOT NULL, "field" character varying NOT NULL, "oldValue" jsonb, "newValue" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer NOT NULL, CONSTRAINT "PK_e9c7267a7a2de0426ffbcd8074c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."playerTeam_teamstatus_enum" AS ENUM('TRANSFERRED_OUT', 'FREE_AGENT', 'NOT_IN_SQUAD', 'UNKNOWN')`);
        await queryRunner.query(`CREATE TABLE "playerTeam" ("season" character varying NOT NULL, "playerId" integer NOT NULL, "teamId" integer NOT NULL, "shirtNumber" integer, "contractEnd" character varying, "isCaptain" boolean NOT NULL, "teamStatus" "public"."playerTeam_teamstatus_enum" NOT NULL DEFAULT 'UNKNOWN', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_98ea2f9d20a5346121509799aa9" PRIMARY KEY ("season", "playerId", "teamId"))`);
        await queryRunner.query(`CREATE TABLE "playerTeamAudit" ("id" SERIAL NOT NULL, "field" character varying NOT NULL, "oldValue" jsonb, "newValue" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer NOT NULL, "season" character varying NOT NULL, "teamId" integer NOT NULL, CONSTRAINT "PK_8f562635ccee5b98be6b1ab76b6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "playerTeamAudit"`);
        await queryRunner.query(`DROP TABLE "playerTeam"`);
        await queryRunner.query(`DROP TYPE "public"."playerTeam_teamstatus_enum"`);
        await queryRunner.query(`DROP TABLE "playerAudit"`);
        await queryRunner.query(`DROP TABLE "player"`);
        await queryRunner.query(`DROP TABLE "fixtureAudit"`);
        await queryRunner.query(`DROP TABLE "fixture"`);
        await queryRunner.query(`DROP TYPE "public"."fixture_fixturestatus_enum"`);
    }

}
