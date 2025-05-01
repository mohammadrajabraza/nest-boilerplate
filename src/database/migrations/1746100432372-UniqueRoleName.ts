import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueRoleName1746100432372 implements MigrationInterface {
  name = 'UniqueRoleName1746100432372';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."company_status_enum" AS ENUM('accepted', 'rejected', 'pending')`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "status" "public"."company_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."company_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "status" character varying NOT NULL`,
    );
  }
}
