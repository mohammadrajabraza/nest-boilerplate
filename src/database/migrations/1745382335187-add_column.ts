import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumn1745382335187 implements MigrationInterface {
  name = 'AddColumn1745382335187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD "is_password_reset" boolean DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile_settings" DROP COLUMN "is_password_reset"`,
    );
  }
}
