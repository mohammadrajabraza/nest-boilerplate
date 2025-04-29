import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExtraColumnsCreatedByUpdatedByDeletedByAndDeletedAt1745959456242
  implements MigrationInterface
{
  name = 'AddExtraColumnsCreatedByUpdatedByDeletedByAndDeletedAt1745959456242';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "companies" ADD "created_by" uuid`);
    await queryRunner.query(`ALTER TABLE "companies" ADD "updated_by" uuid`);
    await queryRunner.query(`ALTER TABLE "companies" ADD "deleted_by" uuid`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "roles" ADD "created_by" uuid`);
    await queryRunner.query(`ALTER TABLE "roles" ADD "updated_by" uuid`);
    await queryRunner.query(`ALTER TABLE "roles" ADD "deleted_by" uuid`);
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "user_roles" ADD "created_by" uuid`);
    await queryRunner.query(`ALTER TABLE "user_roles" ADD "updated_by" uuid`);
    await queryRunner.query(`ALTER TABLE "user_roles" ADD "deleted_by" uuid`);
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD "created_by" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD "updated_by" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD "deleted_by" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "sessions" ADD "created_by" uuid`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "updated_by" uuid`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "deleted_by" uuid`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "created_by" uuid`);
    await queryRunner.query(`ALTER TABLE "users" ADD "updated_by" uuid`);
    await queryRunner.query(`ALTER TABLE "users" ADD "deleted_by" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_by"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_by"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "deleted_by"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "updated_by"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "profile_settings" DROP COLUMN "deleted_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" DROP COLUMN "updated_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" DROP COLUMN "created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP COLUMN "deleted_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP COLUMN "updated_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP COLUMN "created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "deleted_by"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "updated_by"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "deleted_by"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updated_by"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "deleted_at"`);
  }
}
