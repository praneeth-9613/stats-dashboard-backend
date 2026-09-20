import { MigrationInterface, QueryRunner } from "typeorm";

export class Schema1789898758481 implements MigrationInterface {
    name = 'Schema1789898758481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teamSeasonStats" ADD "competitiveMatchesProcessed" integer`);
        await queryRunner.query(`ALTER TABLE "teamSeasonStats" ADD "leagueMatchesProcessed" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teamSeasonStats" DROP COLUMN "leagueMatchesProcessed"`);
        await queryRunner.query(`ALTER TABLE "teamSeasonStats" DROP COLUMN "competitiveMatchesProcessed"`);
    }

}
