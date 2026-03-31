export class HabitStreakItemDto {
  habitId: string;

  habitName: string;

  habitIcon: string | null;

  /** 현재 연속 달성 일수 */
  currentStreak: number;

  /** 최고 연속 달성 일수 */
  bestStreak: number;
}

export class StreakResponseDto {
  /** 전체 종합 현재 스트릭 (모든 활성 습관 100% 달성 연속일) */
  overallCurrentStreak: number;

  /** 전체 종합 최고 스트릭 */
  overallBestStreak: number;

  /** 개별 습관 스트릭 */
  habits: HabitStreakItemDto[];
}
