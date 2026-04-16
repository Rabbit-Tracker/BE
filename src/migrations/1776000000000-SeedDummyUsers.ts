import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDummyUsers1776000000000 implements MigrationInterface {
  name = 'SeedDummyUsers1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const nicknames = [
      '성실러',
      '아침형',
      '밤코딩',
      '운동광',
      '책벌레',
      'JS마스터',
      '타입러',
      'Next짱',
      'React꿈나무',
      '코테중독',
      '러닝맨',
      '집중왕',
      '몰입러',
      '루틴장인',
      '꾸준함',
    ];

    const emojis = ['🐰', '🧠', '🏃', '📚', '🧘', '🧩', '🧑‍💻', '☕️', '🌱', '🔥'];

    const rows = Array.from({ length: 30 }).map((_, idx) => {
      const n = idx + 1;
      const nickname = `${nicknames[idx % nicknames.length]}${n}`;
      const email = `dummy_user_${String(n).padStart(3, '0')}@example.com`;
      const avatarEmoji = emojis[idx % emojis.length];
      const isPrivate = n % 12 === 0;
      return { nickname, email, avatarEmoji, isPrivate };
    });

    for (const row of rows) {
      // 이미 있으면 스킵(중복 시드 방지)
      const existing = (await queryRunner.query(
        `SELECT 1 FROM "users" WHERE "email" = $1 LIMIT 1`,
        [row.email],
      )) as unknown[];
      if (Array.isArray(existing) && existing.length > 0) continue;

      await queryRunner.query(
        `INSERT INTO "users" ("nickname","email","avatarEmoji","avatarUrl","isPrivate","status","timezone")
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [row.nickname, row.email, row.avatarEmoji, null, row.isPrivate, 'active', 'Asia/Seoul'],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE "email" LIKE 'dummy_user_%@example.com'`);
  }
}
