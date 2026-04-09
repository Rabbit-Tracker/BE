export class ContributionResponseDto {
  /** 조회한 일수 */
  days: number;

  /** 날짜별 기여도 레벨 (YYYY-MM-DD → 0|1|2|3|4) */
  contributions: Record<string, 0 | 1 | 2 | 3 | 4>;
}
