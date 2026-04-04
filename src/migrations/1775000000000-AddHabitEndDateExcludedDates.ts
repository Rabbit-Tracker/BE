import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHabitEndDateExcludedDates1775000000000 implements MigrationInterface {
  name = 'AddHabitEndDateExcludedDates1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habits" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" ADD COLUMN IF NOT EXISTS "excludedDates" text array`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN IF EXISTS "excludedDates"`);
    await queryRunner.query(`ALTER TABLE "habits" DROP COLUMN IF EXISTS "endDate"`);
  }
}
