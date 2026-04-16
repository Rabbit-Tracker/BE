import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColorToHabitCategories1775011200000 implements MigrationInterface {
  name = 'AddColorToHabitCategories1775011200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habit_categories" ADD COLUMN "color" character varying(7)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "habit_categories" DROP COLUMN "color"`);
  }
}
