import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export type UpdateScope = 'ALL' | 'FUTURE_INCOMPLETE' | 'THIS_ONLY';

export class UpdateHabitDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'once', 'custom'])
  frequency?: 'daily' | 'weekly' | 'once' | 'custom';

  @IsOptional()
  @IsInt()
  frequencyDetail?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  selectedDays?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notificationTimes?: string[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  /** 수정 범위: ALL(기본) | FUTURE_INCOMPLETE(미완료만) | THIS_ONLY(이 항목만) */
  @IsOptional()
  @IsEnum(['ALL', 'FUTURE_INCOMPLETE', 'THIS_ONLY'])
  scope?: UpdateScope;

  /** scope가 THIS_ONLY 또는 FUTURE_INCOMPLETE일 때 기준 날짜 (ISO date string) */
  @IsOptional()
  @IsDateString()
  fromDate?: string;
}
