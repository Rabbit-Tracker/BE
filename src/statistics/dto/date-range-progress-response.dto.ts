export class DailyProgressDto {
  /** 날짜 (YYYY-MM-DD) */
  date: string;

  /** 완료된 습관 수 */
  completed: number;

  /** 해당 날짜 적용 가능 습관 수 */
  total: number;

  /** 달성률 (0~100, 소수점 1자리) */
  rate: number;
}

export class DateRangeProgressResponseDto {
  /** 일별 진행률 배열 */
  days: DailyProgressDto[];

  /** 기간 평균 달성률 (0~100, 소수점 1자리) */
  averageRate: number;
}
