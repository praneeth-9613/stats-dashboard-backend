import { MigrationInterface, QueryRunner } from "typeorm";

export class Schema1789407105008 implements MigrationInterface {
    name = 'Schema1789407105008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fixture" ADD "homeTeamMatchPlayerStatsSynced" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "fixture" ADD "awayTeamMatchPlayerStatsSynced" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fixture" DROP COLUMN "awayTeamMatchPlayerStatsSynced"`);
        await queryRunner.query(`ALTER TABLE "fixture" DROP COLUMN "homeTeamMatchPlayerStatsSynced"`);
    }

}
