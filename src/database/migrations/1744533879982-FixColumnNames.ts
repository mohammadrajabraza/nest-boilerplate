import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixColumnNames1744533879982 implements MigrationInterface {
  name = 'FixColumnNames1744533879982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "first_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_name" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
  }
}
