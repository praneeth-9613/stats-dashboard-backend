import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1787914600854 implements MigrationInterface {
    name = 'InitialSchema1787914600854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team" ("teamId" integer NOT NULL, "name" character varying NOT NULL, "leagueName" character varying NOT NULL, "primaryColor" character varying, "secondaryColor" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e3c1e347fd4f0813cc7b2e2115b" PRIMARY KEY ("teamId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "team"`);
    }

}
