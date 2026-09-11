import { MigrationInterface, QueryRunner } from "typeorm";

export class Schema1789120612800 implements MigrationInterface {
    name = 'Schema1789120612800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "matchPlayerStats" ("matchId" integer NOT NULL, "leagueId" integer NOT NULL, "season" character varying NOT NULL, "teamId" integer NOT NULL, "data" jsonb, CONSTRAINT "PK_361c6bd6f87b0397dccb29a6d31" PRIMARY KEY ("matchId", "leagueId", "season", "teamId"))`);
        await queryRunner.query(`CREATE TABLE "matchGoalscorers" ("matchId" integer NOT NULL, "leagueId" integer NOT NULL, "season" character varying NOT NULL, "teamId" integer NOT NULL, "data" jsonb, "potm" jsonb, CONSTRAINT "PK_682ccd4c92e825abee11ae47b8c" PRIMARY KEY ("matchId", "leagueId", "season", "teamId"))`);
        await queryRunner.query(`CREATE TABLE "teamSeasonStats" ("leagueId" integer NOT NULL, "season" character varying NOT NULL, "teamId" integer NOT NULL, "data" jsonb NOT NULL, "matchesProcessed" integer NOT NULL, "generatedAt" character varying NOT NULL, CONSTRAINT "PK_f007d28e9593fe2d4ae4357239c" PRIMARY KEY ("leagueId", "season", "teamId"))`);
        await queryRunner.query(`ALTER TABLE "matchPlayerStats" ADD CONSTRAINT "FK_512c9415e5f3bee7e5acee2dbbe" FOREIGN KEY ("teamId", "leagueId", "season") REFERENCES "leagueSeasonTeam"("teamId","leagueId","season") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD CONSTRAINT "FK_f33bf14d436b80b6180ffd11e62" FOREIGN KEY ("teamId", "leagueId", "season") REFERENCES "leagueSeasonTeam"("teamId","leagueId","season") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teamSeasonStats" ADD CONSTRAINT "FK_f007d28e9593fe2d4ae4357239c" FOREIGN KEY ("teamId", "leagueId", "season") REFERENCES "leagueSeasonTeam"("teamId","leagueId","season") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teamSeasonStats" DROP CONSTRAINT "FK_f007d28e9593fe2d4ae4357239c"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP CONSTRAINT "FK_f33bf14d436b80b6180ffd11e62"`);
        await queryRunner.query(`ALTER TABLE "matchPlayerStats" DROP CONSTRAINT "FK_512c9415e5f3bee7e5acee2dbbe"`);
        await queryRunner.query(`DROP TABLE "teamSeasonStats"`);
        await queryRunner.query(`DROP TABLE "matchGoalscorers"`);
        await queryRunner.query(`DROP TABLE "matchPlayerStats"`);
    }

}
