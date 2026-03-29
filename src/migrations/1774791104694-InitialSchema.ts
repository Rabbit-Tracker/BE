import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1774791104694 implements MigrationInterface {
  name = 'InitialSchema1774791104694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nickname" character varying(30) NOT NULL, "email" character varying(255), "avatarUrl" text, "avatarEmoji" character varying(10), "isPrivate" boolean NOT NULL DEFAULT false, "status" character varying(20) NOT NULL DEFAULT 'active', "timezone" character varying(50) NOT NULL DEFAULT 'Asia/Seoul', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token" text NOT NULL, "platform" character varying(10) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_977e24c520c49436d08e5eeea8a" UNIQUE ("token"), CONSTRAINT "PK_84700be257607cfb1f9dc2e52c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "faqs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" character varying(150) NOT NULL, "answer" text NOT NULL, "displayOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedbacks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "content" text NOT NULL, "rating" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "follow_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requester_id" uuid NOT NULL, "target_id" uuid NOT NULL, "status" character varying(10) NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "respondedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_24a94a6006acd87c7070cd1e265" UNIQUE ("requester_id", "target_id"), CONSTRAINT "PK_e3bb7b01985276e9bce698b81bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "follows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "follower_id" uuid NOT NULL, "following_id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8109e59f691f0444b43420f6987" UNIQUE ("follower_id", "following_id"), CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "habit_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying(50) NOT NULL, "icon" character varying(10), "visibility" character varying(10) NOT NULL DEFAULT 'private', "sortOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f3d7058e0fc0624b504ff4e5459" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "habits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "category_id" uuid, "name" character varying(100) NOT NULL, "description" text, "frequency" character varying(10) NOT NULL, "frequencyDetail" integer, "selectedDays" integer array, "notificationTimes" text array NOT NULL DEFAULT '{}', "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "icon" character varying(10), "status" character varying(10) NOT NULL DEFAULT 'active', "archivedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_b3ec33c2d7af69d09fcf4af7e39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "habit_checks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "habit_id" uuid NOT NULL, "user_id" uuid NOT NULL, "checkDate" TIMESTAMP WITH TIME ZONE NOT NULL, "isChecked" boolean NOT NULL DEFAULT true, "checkedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "notificationTime" character varying(5), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2354e068b3258772150a6b91477" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(200) NOT NULL, "content" text NOT NULL, "isPublished" boolean NOT NULL DEFAULT false, "isPinned" boolean NOT NULL DEFAULT false, "publishedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3eb18c29da25d6935fcbe584237" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notice_reads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "notice_id" uuid NOT NULL, "user_id" uuid NOT NULL, "readAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_0bd6487722271aea4e61f7ef711" UNIQUE ("notice_id", "user_id"), CONSTRAINT "PK_510757f8a8bbe38b23f74d05776" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "titleTemplate" character varying(100) NOT NULL, "bodyTemplate" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_0f527489aa40b6ba96faf6b5024" UNIQUE ("code"), CONSTRAINT "PK_76f0fc48b8d057d2ae7f3a2848a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" character varying(20) NOT NULL, "title" character varying(200) NOT NULL, "body" text, "habitId" uuid, "noticeId" uuid, "readAt" TIMESTAMP WITH TIME ZONE, "sentAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "onboarding_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "lifestyle" character varying(20) NOT NULL, "ageRange" character varying(20) NOT NULL, "jobCategory" character varying(30) NOT NULL, "jobText" character varying(50), "interests" text array NOT NULL, "purposeText" character varying(200) NOT NULL, "difficulty" character varying(10) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c56dd404bb94e735c0515298c30" UNIQUE ("user_id"), CONSTRAINT "REL_c56dd404bb94e735c0515298c3" UNIQUE ("user_id"), CONSTRAINT "PK_314c0fb9547c3b4a0fc497d4cd6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_auth_providers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "provider" character varying(10) NOT NULL, "providerUserId" character varying(255) NOT NULL, "email" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9a2b64c1c8cb8cb3876debf7c8c" UNIQUE ("provider", "providerUserId"), CONSTRAINT "PK_e3b60f30b8112ac5bb474a2fe4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_notification_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "isPushEnabled" boolean NOT NULL DEFAULT true, "doNotDisturbStart" character varying(5), "doNotDisturbEnd" character varying(5), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_52182ffd0f785e8256f8fcb4fd6" UNIQUE ("user_id"), CONSTRAINT "REL_52182ffd0f785e8256f8fcb4fd" UNIQUE ("user_id"), CONSTRAINT "PK_a195de67d093e096152f387afbd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "refreshTokenHash" character varying(255) NOT NULL, "userAgent" character varying(255), "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "lastUsedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_tokens" ADD CONSTRAINT "FK_17e1f528b993c6d55def4cf5bea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follow_requests" ADD CONSTRAINT "FK_5c7b3b3b9c154b3256d0e002c30" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follow_requests" ADD CONSTRAINT "FK_3f617bf85b7ce2603882b019191" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" ADD CONSTRAINT "FK_54b5dc2739f2dea57900933db66" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" ADD CONSTRAINT "FK_c518e3988b9c057920afaf2d8c0" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "habit_categories" ADD CONSTRAINT "FK_5ad8e48ea94c1a9e65bcbbf9286" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" ADD CONSTRAINT "FK_652ea1f27d16800eca4259546a1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" ADD CONSTRAINT "FK_9d4ef3439277e78ea7e922eb4d5" FOREIGN KEY ("category_id") REFERENCES "habit_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "habit_checks" ADD CONSTRAINT "FK_de80d6a36f9d5dbd911066e9f3c" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "habit_checks" ADD CONSTRAINT "FK_07ce8d11c4d123dcd3260530d78" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notice_reads" ADD CONSTRAINT "FK_9717ae462552000c4dad15e9bb7" FOREIGN KEY ("notice_id") REFERENCES "notices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notice_reads" ADD CONSTRAINT "FK_1120e5b2c813bf9ee90895a1d0b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_profiles" ADD CONSTRAINT "FK_c56dd404bb94e735c0515298c30" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_providers" ADD CONSTRAINT "FK_f1b986eb2b94d3c3beaf580c092" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "FK_52182ffd0f785e8256f8fcb4fd6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_e9658e959c490b0a634dfc54783"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "FK_52182ffd0f785e8256f8fcb4fd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_providers" DROP CONSTRAINT "FK_f1b986eb2b94d3c3beaf580c092"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_profiles" DROP CONSTRAINT "FK_c56dd404bb94e735c0515298c30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notice_reads" DROP CONSTRAINT "FK_1120e5b2c813bf9ee90895a1d0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notice_reads" DROP CONSTRAINT "FK_9717ae462552000c4dad15e9bb7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habit_checks" DROP CONSTRAINT "FK_07ce8d11c4d123dcd3260530d78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habit_checks" DROP CONSTRAINT "FK_de80d6a36f9d5dbd911066e9f3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" DROP CONSTRAINT "FK_9d4ef3439277e78ea7e922eb4d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" DROP CONSTRAINT "FK_652ea1f27d16800eca4259546a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habit_categories" DROP CONSTRAINT "FK_5ad8e48ea94c1a9e65bcbbf9286"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "FK_c518e3988b9c057920afaf2d8c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follows" DROP CONSTRAINT "FK_54b5dc2739f2dea57900933db66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follow_requests" DROP CONSTRAINT "FK_3f617bf85b7ce2603882b019191"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follow_requests" DROP CONSTRAINT "FK_5c7b3b3b9c154b3256d0e002c30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_tokens" DROP CONSTRAINT "FK_17e1f528b993c6d55def4cf5bea"`,
    );
    await queryRunner.query(`DROP TABLE "user_sessions"`);
    await queryRunner.query(`DROP TABLE "user_notification_settings"`);
    await queryRunner.query(`DROP TABLE "user_auth_providers"`);
    await queryRunner.query(`DROP TABLE "onboarding_profiles"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "notification_templates"`);
    await queryRunner.query(`DROP TABLE "notice_reads"`);
    await queryRunner.query(`DROP TABLE "notices"`);
    await queryRunner.query(`DROP TABLE "habit_checks"`);
    await queryRunner.query(`DROP TABLE "habits"`);
    await queryRunner.query(`DROP TABLE "habit_categories"`);
    await queryRunner.query(`DROP TABLE "follows"`);
    await queryRunner.query(`DROP TABLE "follow_requests"`);
    await queryRunner.query(`DROP TABLE "feedbacks"`);
    await queryRunner.query(`DROP TABLE "faqs"`);
    await queryRunner.query(`DROP TABLE "device_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
