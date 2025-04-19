import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1745050472938 implements MigrationInterface {
  name = 'User1745050472938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "auth_providers" text array DEFAULT '{email}'`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "google_id" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "profile_picture" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "profile_picture"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "auth_providers"`);
  }
}
