import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788958945813 implements MigrationInterface {
    name = 'InitialSchema1788958945813'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reserveTeam" ("parentTeamId" integer NOT NULL, "teamId" integer NOT NULL, "teamName" character varying NOT NULL, CONSTRAINT "PK_06054d13cd88c216bccab879093" PRIMARY KEY ("parentTeamId", "teamId"))`);
        await queryRunner.query(`CREATE TABLE "team" ("teamId" integer NOT NULL, "name" character varying NOT NULL, "primaryColor" character varying, "secondaryColor" character varying, "gradientAngle" integer NOT NULL DEFAULT '180', "gradientStops" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e3c1e347fd4f0813cc7b2e2115b" PRIMARY KEY ("teamId"))`);
        await queryRunner.query(`CREATE TABLE "league" ("leagueId" integer NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_347f0861f12c54492c553729403" PRIMARY KEY ("leagueId"))`);
        await queryRunner.query(`CREATE TYPE "public"."fixture_fixturestatus_enum" AS ENUM('NEW', 'MARKED_FOR_PROCESSING', 'RESCHEDULED', 'PROCESSED')`);
        await queryRunner.query(`CREATE TABLE "fixture" ("matchId" integer NOT NULL, "season" character varying NOT NULL, "leagueId" integer NOT NULL, "teamId" integer NOT NULL, "competition" character varying NOT NULL, "homeAway" character varying NOT NULL, "completed" boolean NOT NULL, "notStarted" boolean NOT NULL, "fixtureDate" TIMESTAMP NOT NULL, "homeId" integer NOT NULL, "awayId" integer NOT NULL, "homeName" character varying NOT NULL, "awayName" character varying NOT NULL, "homeScore" integer, "awayScore" integer, "scoreStr" character varying, "isPenaltyShootout" boolean NOT NULL DEFAULT false, "fixtureStatus" "public"."fixture_fixturestatus_enum" NOT NULL, "stadiumName" character varying, "stadiumCity" character varying, "stadiumCountry" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5488946ee5eef68e2c4864ba1f6" PRIMARY KEY ("matchId"))`);
        await queryRunner.query(`CREATE TABLE "leagueSeasonTeam" ("teamId" integer NOT NULL, "leagueId" integer NOT NULL, "season" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_64d0dd4b872c2d29f5eda1bc262" PRIMARY KEY ("teamId", "leagueId", "season"))`);
        await queryRunner.query(`CREATE TABLE "fixtureAudit" ("id" SERIAL NOT NULL, "field" character varying NOT NULL, "oldValue" jsonb, "newValue" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "matchId" integer NOT NULL, CONSTRAINT "PK_6d2973158e144d1dd3c7a06ac3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."playerTeam_teamstatus_enum" AS ENUM('TRANSFERRED_OUT', 'NOT_IN_SQUAD', 'CURRENT', 'RESERVE')`);
        await queryRunner.query(`CREATE TABLE "playerTeam" ("playerId" integer NOT NULL, "season" character varying NOT NULL, "leagueId" integer NOT NULL, "teamId" integer NOT NULL, "shirtNumber" integer, "contractEnd" character varying, "isCaptain" boolean NOT NULL, "onLoan" boolean NOT NULL, "teamStatus" "public"."playerTeam_teamstatus_enum" NOT NULL DEFAULT 'CURRENT', "transferredTo" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c7668b18c8a8c5a2c54e12b5fbd" PRIMARY KEY ("playerId", "season", "leagueId", "teamId"))`);
        await queryRunner.query(`CREATE TABLE "player" ("playerId" integer NOT NULL, "name" character varying NOT NULL, "country" character varying, "height" character varying, "transferValue" character varying, "preferredFoot" character varying, "age" integer, "positions" jsonb, "injury" jsonb, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee365af3f201a00d9a917bc45b0" PRIMARY KEY ("playerId"))`);
        await queryRunner.query(`CREATE TABLE "playerAudit" ("id" SERIAL NOT NULL, "field" character varying NOT NULL, "oldValue" jsonb, "newValue" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer NOT NULL, CONSTRAINT "PK_e9c7267a7a2de0426ffbcd8074c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "playerTeamAudit" ("id" SERIAL NOT NULL, "field" character varying NOT NULL, "oldValue" jsonb, "newValue" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "playerId" integer NOT NULL, "season" character varying NOT NULL, "leagueId" integer NOT NULL, "teamId" integer NOT NULL, CONSTRAINT "PK_8f562635ccee5b98be6b1ab76b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reserveTeam" ADD CONSTRAINT "FK_013dea326610a4f8cb4c9653722" FOREIGN KEY ("parentTeamId") REFERENCES "team"("teamId") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fixture" ADD CONSTRAINT "FK_4fbdb3dde75b3f02219c25ab578" FOREIGN KEY ("teamId", "leagueId", "season") REFERENCES "leagueSeasonTeam"("teamId","leagueId","season") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leagueSeasonTeam" ADD CONSTRAINT "FK_d85c8c5d044c13ef9f3d23af1f8" FOREIGN KEY ("leagueId") REFERENCES "league"("leagueId") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leagueSeasonTeam" ADD CONSTRAINT "FK_cc67524c6c46ed7f388ec653468" FOREIGN KEY ("teamId") REFERENCES "team"("teamId") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playerTeam" ADD CONSTRAINT "FK_6747da60a189741493c7f9eb021" FOREIGN KEY ("playerId") REFERENCES "player"("playerId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playerTeam" ADD CONSTRAINT "FK_dbd50314232ac3b4242de4631ff" FOREIGN KEY ("teamId", "leagueId", "season") REFERENCES "leagueSeasonTeam"("teamId","leagueId","season") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playerTeam" DROP CONSTRAINT "FK_dbd50314232ac3b4242de4631ff"`);
        await queryRunner.query(`ALTER TABLE "playerTeam" DROP CONSTRAINT "FK_6747da60a189741493c7f9eb021"`);
        await queryRunner.query(`ALTER TABLE "leagueSeasonTeam" DROP CONSTRAINT "FK_cc67524c6c46ed7f388ec653468"`);
        await queryRunner.query(`ALTER TABLE "leagueSeasonTeam" DROP CONSTRAINT "FK_d85c8c5d044c13ef9f3d23af1f8"`);
        await queryRunner.query(`ALTER TABLE "fixture" DROP CONSTRAINT "FK_4fbdb3dde75b3f02219c25ab578"`);
        await queryRunner.query(`ALTER TABLE "reserveTeam" DROP CONSTRAINT "FK_013dea326610a4f8cb4c9653722"`);
        await queryRunner.query(`DROP TABLE "playerTeamAudit"`);
        await queryRunner.query(`DROP TABLE "playerAudit"`);
        await queryRunner.query(`DROP TABLE "player"`);
        await queryRunner.query(`DROP TABLE "playerTeam"`);
        await queryRunner.query(`DROP TYPE "public"."playerTeam_teamstatus_enum"`);
        await queryRunner.query(`DROP TABLE "fixtureAudit"`);
        await queryRunner.query(`DROP TABLE "leagueSeasonTeam"`);
        await queryRunner.query(`DROP TABLE "fixture"`);
        await queryRunner.query(`DROP TYPE "public"."fixture_fixturestatus_enum"`);
        await queryRunner.query(`DROP TABLE "league"`);
        await queryRunner.query(`DROP TABLE "team"`);
        await queryRunner.query(`DROP TABLE "reserveTeam"`);
    }

}
