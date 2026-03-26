import { IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateHabitCategoryDto {
  // 카테고리 소유자 (유저 UUID)
  @IsUUID()
  userId: string;

  // 카테고리 이름 (최대 50자)
  @IsString()
  @Length(1, 50)
  name: string;

  // 카테고리 아이콘(이모지 등, 선택 / 최대 10자)
  @IsOptional()
  @IsString()
  @Length(1, 10)
  icon?: string | null;

  // 공개 범위 (기본값: private)
  @IsOptional()
  @IsIn(['private', 'friends', 'public'])
  visibility?: 'private' | 'friends' | 'public';

  // 정렬 우선순위 (기본값: 0)
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
