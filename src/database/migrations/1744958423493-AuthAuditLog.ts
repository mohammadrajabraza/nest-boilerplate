import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthAuditLog1744958423493 implements MigrationInterface {
  name = 'AuthAuditLog1744958423493';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "event_type" text NOT NULL, "device_info" text, "ip_address" character varying, "user_id" uuid NOT NULL, "event_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_be11d76bd32256469e1a14a97db" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ALTER COLUMN "refresh_token" SET NOT NULL`,
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
      `ALTER TABLE "sessions" ALTER COLUMN "refresh_token" DROP NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "auth_audit_logs"`);
  }
}
