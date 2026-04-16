-- faqs 더미 데이터 (PostgreSQL, Faq 엔티티 컬럼과 동일)
-- - 질문이 '더미_%' 로 시작하는 행만 시드 대상 (재실행 시 해당 행만 삭제 후 재삽입)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DELETE FROM faqs
WHERE question LIKE '더미_%';

INSERT INTO faqs (
  id,
  question,
  answer,
  "displayOrder",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    gen_random_uuid(),
    '더미_Rabbit Tracker는 어떤 앱인가요?',
    'Rabbit Tracker는 매일의 작은 습관을 기록하고, 잔디 형태의 시각화로 꾸준함을 관리할 수 있게 도와주는 습관 트래킹 앱이에요.',
    0,
    timestamptz '2026-04-01 10:00:00+09',
    timestamptz '2026-04-01 10:00:00+09'
  ),
  (
    gen_random_uuid(),
    '더미_데이터는 어떻게 저장되나요?',
    '계정에 연동된 데이터는 서버에 안전하게 저장되며, 앱 설정에서 백업·복구 정책을 확인할 수 있어요. (베타 기준 문구는 서비스 정책에 맞게 수정하세요.)',
    1,
    timestamptz '2026-04-01 10:01:00+09',
    timestamptz '2026-04-01 10:01:00+09'
  ),
  (
    gen_random_uuid(),
    '더미_하루 체크 횟수에 제한이 있나요?',
    '기본적으로는 제한이 없지만, 대부분의 습관은 하루 한 번 체크하는 흐름을 권장하고 있어요.',
    2,
    timestamptz '2026-04-01 10:02:00+09',
    timestamptz '2026-04-01 10:02:00+09'
  );

COMMIT;
