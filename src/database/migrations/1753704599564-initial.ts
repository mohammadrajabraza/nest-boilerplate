import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1753704599564 implements MigrationInterface {
  name = 'Initial1753704599564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."company_status_enum" AS ENUM('accepted', 'rejected', 'pending')`);
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "name" character varying NOT NULL, "ntn" character varying NOT NULL, "address" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "industry" character varying NOT NULL, "status" "public"."company_status_enum" NOT NULL DEFAULT 'pending', "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "name" character varying NOT NULL, "description" text, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "role_id" uuid NOT NULL, "user_id" uuid, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "is_email_verified" boolean DEFAULT false, "is_phone_verified" boolean DEFAULT false, "is_password_reset" boolean DEFAULT true, "user_id" uuid NOT NULL, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, CONSTRAINT "UQ_93fb780e78aedf3144ba430fa9f" UNIQUE ("user_id"), CONSTRAINT "REL_93fb780e78aedf3144ba430fa9" UNIQUE ("user_id"), CONSTRAINT "PK_a0e6e189e9ba9517ce9b96f13aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "access_token" text NOT NULL, "refresh_token" text NOT NULL, "device_token" text, "time_zone" character varying, "user_id" uuid NOT NULL, "login_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "logout_at" TIMESTAMP WITH TIME ZONE, "is_logged_in" boolean NOT NULL DEFAULT false, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "first_name" character varying, "last_name" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone" character varying, "auth_providers" text array DEFAULT '{email}', "google_id" text, "profile_picture" text, "company_id" uuid, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "event_type" text NOT NULL, "device_info" text, "ip_address" character varying, "user_id" uuid, "body" jsonb, "response" jsonb, "event_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_be11d76bd32256469e1a14a97db" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "token" text NOT NULL, "token_type" character varying NOT NULL DEFAULT 'access', "issued_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_revoked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "url" character varying NOT NULL, "file_name" character varying NOT NULL, "file_type" character varying NOT NULL, "size" integer NOT NULL, "tenant_id" uuid NOT NULL, "entity_type" character varying NOT NULL, "entity_id" uuid NOT NULL, "category" character varying NOT NULL, "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "uploaded_by_id" uuid, "deleted_by_id" uuid, CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_747580cfe76ebd751cbcd72b181" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_39303c6d725941d35191290fc68" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_021612df27a9e069dda5b7abb1f" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_ca4df9b8772f1c1a02f3a560555" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_9991d25b571eb593c19f4208fae" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_c3c4235d8af94bc206635fe7cbb" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_4a4bff0f02e88cbdf770241ca8f" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_42353a3d71b2924e2b384901d7f" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_7aab1939c84759090de748731a9" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_4a39f3095781cdd9d6061afaae5" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_747b580d73db0ad78963d78b076" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_6afbac9a2aa8004821807ed92c8" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_81ca2776a4fa3eea180545ab895" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_819bb0854b79f6a8b0babf95526" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_6702f1d04c46077db0f85fcdb3d" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_947e863084a338ac018f1beab96" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_84bb5109aa423f699fb79c10854" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_c8bce92db0a6d8ce74af96c2d51" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD CONSTRAINT "FK_ccf4750af15745f3c88b48832fb" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD CONSTRAINT "FK_ddf5030f5f3dbc4438243525220" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD CONSTRAINT "FK_7fbd0a27be6f774ea935b7c3140" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD CONSTRAINT "profile_setting_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD CONSTRAINT "FK_68bfd5198ae2f78b5198685aef9" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD CONSTRAINT "FK_3268cf20859ecc0c09c03cf5d70" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_settings" ADD CONSTRAINT "FK_8fcc401e4e034ee050b1ac82d31" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_1ccf045da14e5350b26ee882592" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_0cd5bd2c00a5ffc74c9f55529c1" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_19a4a215e7ac3d8965e1de49cc8" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "user_session_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_7a1091a6fc423e6af88ce9b7105" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_b18021756e915d0d31e7aebad17" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_1883ebace4a695f589c7c905629" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_1bbd34899b8e74ef2a7f3212806" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_80e310e761f458f272c20ea6add" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_4241f21b9bb35e82a6217af1aad" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "user_company_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_f32b1cb14a9920477bcfd63df2c" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_b75c92ef36f432fe68ec300a7d4" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_021e2c9d9dca9f0885e8d738326" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_audit_logs" ADD CONSTRAINT "user_auth_audit_log_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_70a38fc450d3b433c86b67e69d6" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_8dfc7dc6b1b9e29b32e0ef58c0c" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_8dfc7dc6b1b9e29b32e0ef58c0c"`);
    await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_70a38fc450d3b433c86b67e69d6"`);
    await queryRunner.query(`ALTER TABLE "auth_audit_logs" DROP CONSTRAINT "user_auth_audit_log_fkey"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_021e2c9d9dca9f0885e8d738326"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_b75c92ef36f432fe68ec300a7d4"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_f32b1cb14a9920477bcfd63df2c"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "user_company_fkey"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_4241f21b9bb35e82a6217af1aad"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_80e310e761f458f272c20ea6add"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_1bbd34899b8e74ef2a7f3212806"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_1883ebace4a695f589c7c905629"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_b18021756e915d0d31e7aebad17"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_7a1091a6fc423e6af88ce9b7105"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "user_session_fkey"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_19a4a215e7ac3d8965e1de49cc8"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_0cd5bd2c00a5ffc74c9f55529c1"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_1ccf045da14e5350b26ee882592"`);
    await queryRunner.query(`ALTER TABLE "profile_settings" DROP CONSTRAINT "FK_8fcc401e4e034ee050b1ac82d31"`);
    await queryRunner.query(`ALTER TABLE "profile_settings" DROP CONSTRAINT "FK_3268cf20859ecc0c09c03cf5d70"`);
    await queryRunner.query(`ALTER TABLE "profile_settings" DROP CONSTRAINT "FK_68bfd5198ae2f78b5198685aef9"`);
    await queryRunner.query(`ALTER TABLE "profile_settings" DROP CONSTRAINT "profile_setting_user_fkey"`);
    await queryRunner.query(`ALTER TABLE "profile_settings" DROP CONSTRAINT "FK_7fbd0a27be6f774ea935b7c3140"`);
    await queryRunner.query(`ALTER TABLE "profile_settings" DROP CONSTRAINT "FK_ddf5030f5f3dbc4438243525220"`);
    await queryRunner.query(`ALTER TABLE "profile_settings" DROP CONSTRAINT "FK_ccf4750af15745f3c88b48832fb"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_c8bce92db0a6d8ce74af96c2d51"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_84bb5109aa423f699fb79c10854"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_947e863084a338ac018f1beab96"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_fkey"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_fkey"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_6702f1d04c46077db0f85fcdb3d"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_819bb0854b79f6a8b0babf95526"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_81ca2776a4fa3eea180545ab895"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_6afbac9a2aa8004821807ed92c8"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_747b580d73db0ad78963d78b076"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_4a39f3095781cdd9d6061afaae5"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_7aab1939c84759090de748731a9"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_42353a3d71b2924e2b384901d7f"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_4a4bff0f02e88cbdf770241ca8f"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_c3c4235d8af94bc206635fe7cbb"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_9991d25b571eb593c19f4208fae"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_ca4df9b8772f1c1a02f3a560555"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_021612df27a9e069dda5b7abb1f"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_39303c6d725941d35191290fc68"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_747580cfe76ebd751cbcd72b181"`);
    await queryRunner.query(`DROP TABLE "attachments"`);
    await queryRunner.query(`DROP TABLE "tokens"`);
    await queryRunner.query(`DROP TABLE "auth_audit_logs"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "profile_settings"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TYPE "public"."company_status_enum"`);
  }
}
