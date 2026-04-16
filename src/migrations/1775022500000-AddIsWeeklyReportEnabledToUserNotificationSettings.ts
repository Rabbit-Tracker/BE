import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsWeeklyReportEnabledToUserNotificationSettings1775022500000 implements MigrationInterface {
  name = 'AddIsWeeklyReportEnabledToUserNotificationSettings1775022500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD COLUMN "isWeeklyReportEnabled" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP COLUMN "isWeeklyReportEnabled"`,
    );
  }
}
