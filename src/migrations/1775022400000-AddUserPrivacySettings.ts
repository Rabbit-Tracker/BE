import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPrivacySettings1775022400000 implements MigrationInterface {
  name = 'AddUserPrivacySettings1775022400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_privacy_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "todayProgressFriendsOnly" boolean NOT NULL DEFAULT false,
        "contributionVisibility" character varying(20) NOT NULL DEFAULT 'friends',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_privacy_settings_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_user_privacy_settings_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_privacy_settings" ADD CONSTRAINT "FK_user_privacy_settings_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_privacy_settings" DROP CONSTRAINT "FK_user_privacy_settings_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "user_privacy_settings"`);
  }
}
