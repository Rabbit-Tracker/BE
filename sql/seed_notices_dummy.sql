-- notices 더미 데이터 (PostgreSQL, Notice 엔티티 컬럼과 동일)
-- - 제목이 '더미_%' 로 시작하는 행만 시드 대상 (재실행 시 해당 행만 삭제 후 재삽입)
-- - 앱 목록에는 isPublished = true 인 행만 노출됨

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DELETE FROM notices
WHERE title LIKE '더미_%';

INSERT INTO notices (
  id,
  title,
  content,
  "isPublished",
  "isPinned",
  "publishedAt",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    gen_random_uuid(),
    '더미_Rabbit Tracker 베타 오픈 안내',
    $notice$
Rabbit Tracker 베타 버전에 참여해 주셔서 감사합니다.

이번 베타에서는 기본적인 습관 생성 · 체크 · 잔디 보기 기능에 집중하고 있어요.

사용하시면서 느낀 점이나 개선 아이디어가 있다면 마이페이지 > 도움말 & 지원 > 피드백 보내기를 통해 언제든지 알려주세요.
$notice$,
    true,
    true,
    timestamptz '2026-02-01 10:00:00+09',
    timestamptz '2026-02-01 09:00:00+09',
    timestamptz '2026-02-01 09:00:00+09'
  ),
  (
    gen_random_uuid(),
    '더미_데이터 초기화 기능 관련 안내',
    $notice2$
현재 베타 환경에서는 테스트 편의를 위해 앱 내에서 데이터를 초기화할 수 있는 기능을 제공하고 있습니다.

정식 버전에서는 의도치 않은 데이터 손실을 방지하기 위해 이 기능의 위치와 사용 방식을 조정할 예정입니다.
$notice2$,
    true,
    false,
    timestamptz '2026-02-10 15:30:00+09',
    timestamptz '2026-02-10 14:00:00+09',
    timestamptz '2026-02-10 14:00:00+09'
  ),
  (
    gen_random_uuid(),
    '더미_비공개 초안 공지(앱에 안 보임)',
    '이 행은 isPublished 가 false 라서 클라이언트 공개 API 목록/상세에 나오지 않아.',
    false,
    false,
    NULL,
    now(),
    now()
  );

COMMIT;
