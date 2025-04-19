import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthAuditLog1745031075642 implements MigrationInterface {
  name = 'AuthAuditLog1745031075642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth_audit_logs" ADD "body" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "auth_audit_logs" ADD "response" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_audit_logs" DROP CONSTRAINT "user_auth_audit_log_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_audit_logs" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_audit_logs" ADD CONSTRAINT "user_auth_audit_log_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_audit_logs" DROP CONSTRAINT "user_auth_audit_log_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_audit_logs" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_audit_logs" ADD CONSTRAINT "user_auth_audit_log_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_audit_logs" DROP COLUMN "response"`,
    );
    await queryRunner.query(`ALTER TABLE "auth_audit_logs" DROP COLUMN "body"`);
  }
}
