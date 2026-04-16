-- users 더미 데이터 시드 (PostgreSQL)
-- - uuid 생성에 pgcrypto(gen_random_uuid()) 사용
-- - 여러 번 실행해도 동일 더미만 재생성되도록 구성

BEGIN;

-- uuid 생성 함수 사용을 위한 확장 (권한 없으면 실패할 수 있음)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 더미로만 쓰는 계정들은 nickname 접두사로 구분해서 정리
DELETE FROM users
WHERE nickname LIKE 'dummy_%';

INSERT INTO users (
  id,
  nickname,
  email,
  avatarUrl,
  avatarEmoji,
  isPrivate,
  status,
  timezone,
  "createdAt",
  "updatedAt",
  "deletedAt"
)
VALUES
  (
    gen_random_uuid(),
    'dummy_rabbit_01',
    'dummy.rabbit01@example.com',
    'https://picsum.photos/seed/rabbit01/256/256',
    '🐰',
    false,
    'active',
    'Asia/Seoul',
    now(),
    now(),
    NULL
  ),
  (
    gen_random_uuid(),
    'dummy_rabbit_02',
    'dummy.rabbit02@example.com',
    'https://picsum.photos/seed/rabbit02/256/256',
    '🥕',
    true,
    'active',
    'Asia/Seoul',
    now() - interval '2 days',
    now() - interval '1 days',
    NULL
  ),
  (
    gen_random_uuid(),
    'dummy_rabbit_03',
    NULL,
    NULL,
    '🌙',
    false,
    'suspended',
    'America/Los_Angeles',
    now() - interval '10 days',
    now() - interval '3 days',
    NULL
  ),
  (
    gen_random_uuid(),
    'dummy_rabbit_04',
    'dummy.rabbit04@example.com',
    NULL,
    NULL,
    false,
    'deleted',
    'Europe/London',
    now() - interval '60 days',
    now() - interval '30 days',
    now() - interval '1 days'
  ),
  (
    gen_random_uuid(),
    'dummy_rabbit_05',
    'dummy.rabbit05@example.com',
    'https://picsum.photos/seed/rabbit05/256/256',
    '🧠',
    true,
    'active',
    'Asia/Tokyo',
    now() - interval '1 hours',
    now() - interval '10 minutes',
    NULL
  );

COMMIT;

