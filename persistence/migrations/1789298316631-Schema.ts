import { MigrationInterface, QueryRunner } from "typeorm";

export class Schema1789298316631 implements MigrationInterface {
    name = 'Schema1789298316631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fixture" DROP COLUMN "homeAway"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fixture" ADD "homeAway" character varying NOT NULL`);
    }

}
