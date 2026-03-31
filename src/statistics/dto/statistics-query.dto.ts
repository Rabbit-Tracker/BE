import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class StatisticsQueryDto {
  @IsUUID()
  userId: string;
}

export class DateRangeQueryDto extends StatisticsQueryDto {
  /** 기준 날짜 (YYYY-MM-DD). 미제공 시 오늘 */
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class CategoryQueryDto extends StatisticsQueryDto {
  @IsIn(['week', 'month'])
  period: 'week' | 'month';

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class ContributionQueryDto extends StatisticsQueryDto {
  /** 조회 일수 (기본 150, 최대 365) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number;
}
