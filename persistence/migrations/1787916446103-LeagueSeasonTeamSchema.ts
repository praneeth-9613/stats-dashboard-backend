import { MigrationInterface, QueryRunner } from "typeorm";

export class LeagueSeasonTeamSchema1787916446103 implements MigrationInterface {
    name = 'LeagueSeasonTeamSchema1787916446103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "leagueSeasonTeam" ("teamId" integer NOT NULL, "leagueId" integer NOT NULL, "season" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_64d0dd4b872c2d29f5eda1bc262" PRIMARY KEY ("teamId", "leagueId", "season"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "leagueSeasonTeam"`);
    }

}
