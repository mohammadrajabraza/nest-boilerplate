import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeDateTimeColumnNames1744533394359
  implements MigrationInterface
{
  name = 'ChangeDateTimeColumnNames1744533394359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
