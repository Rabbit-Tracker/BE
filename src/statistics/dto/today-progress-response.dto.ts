export class TodayProgressResponseDto {
  /** 완료된 습관 수 */
  completed: number;

  /** 전체 활성 습관 수 */
  total: number;

  /** 달성률 (0~100, 소수점 1자리) */
  rate: number;
}
