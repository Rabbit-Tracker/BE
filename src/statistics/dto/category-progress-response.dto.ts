export class CategoryProgressItemDto {
  /** 카테고리 ID (null = 미분류) */
  categoryId: string | null;

  categoryName: string;

  categoryIcon: string | null;

  /** 완료된 체크 수 */
  completed: number;

  /** 전체 적용 가능 체크 수 */
  total: number;

  /** 달성률 (0~100, 소수점 1자리) */
  rate: number;
}

export class CategoryProgressResponseDto {
  period: 'week' | 'month';

  categories: CategoryProgressItemDto[];

  bestCategory: CategoryProgressItemDto | null;

  worstCategory: CategoryProgressItemDto | null;
}
