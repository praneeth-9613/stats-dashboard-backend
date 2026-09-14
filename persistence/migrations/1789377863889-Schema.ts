import { MigrationInterface, QueryRunner } from "typeorm";

export class Schema1789377863889 implements MigrationInterface {
    name = 'Schema1789377863889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP CONSTRAINT "FK_f33bf14d436b80b6180ffd11e62"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP CONSTRAINT "PK_682ccd4c92e825abee11ae47b8c"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD CONSTRAINT "PK_10e91f47b8d3c588ad1868f8bed" PRIMARY KEY ("matchId", "leagueId", "season")`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP COLUMN "teamId"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD "homeId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP CONSTRAINT "PK_10e91f47b8d3c588ad1868f8bed"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD CONSTRAINT "PK_3d982c08ec8b261738be2b9e0fd" PRIMARY KEY ("matchId", "leagueId", "season", "homeId")`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD "awayId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP CONSTRAINT "PK_3d982c08ec8b261738be2b9e0fd"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD CONSTRAINT "PK_baff21b79014fed6128d456b621" PRIMARY KEY ("matchId", "leagueId", "season", "homeId", "awayId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP CONSTRAINT "PK_baff21b79014fed6128d456b621"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD CONSTRAINT "PK_3d982c08ec8b261738be2b9e0fd" PRIMARY KEY ("matchId", "leagueId", "season", "homeId")`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP COLUMN "awayId"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP CONSTRAINT "PK_3d982c08ec8b261738be2b9e0fd"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD CONSTRAINT "PK_10e91f47b8d3c588ad1868f8bed" PRIMARY KEY ("matchId", "leagueId", "season")`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP COLUMN "homeId"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD "teamId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP CONSTRAINT "PK_10e91f47b8d3c588ad1868f8bed"`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD CONSTRAINT "PK_682ccd4c92e825abee11ae47b8c" PRIMARY KEY ("matchId", "leagueId", "season", "teamId")`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD CONSTRAINT "FK_f33bf14d436b80b6180ffd11e62" FOREIGN KEY ("teamId", "leagueId", "season") REFERENCES "leagueSeasonTeam"("teamId","leagueId","season") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
