import { MigrationInterface, QueryRunner } from "typeorm";

export class Schema1789815028569 implements MigrationInterface {
    name = 'Schema1789815028569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matchPlayerStats" ADD "competitionId" integer`);
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" ADD "competitionId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matchGoalscorers" DROP COLUMN "competitionId"`);
        await queryRunner.query(`ALTER TABLE "matchPlayerStats" DROP COLUMN "competitionId"`);
    }

}
