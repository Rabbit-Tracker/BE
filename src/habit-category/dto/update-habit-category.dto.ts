import { IsIn, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateHabitCategoryDto {
  // 카테고리 이름 (선택 / 최대 50자)
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  // 카테고리 아이콘 (선택 / null로 보내면 제거)
  @IsOptional()
  @IsString()
  @Length(1, 10)
  icon?: string | null;

  // 공개 범위 (선택)
  @IsOptional()
  @IsIn(['private', 'friends', 'public'])
  visibility?: 'private' | 'friends' | 'public';

  // 정렬 우선순위 (선택)
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
