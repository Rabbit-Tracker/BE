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

export class CreateHabitDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(['daily', 'weekly', 'once', 'custom'])
  frequency: 'daily' | 'weekly' | 'once' | 'custom';

  @IsOptional()
  @IsInt()
  frequencyDetail?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  selectedDays?: number[];

  @IsArray()
  @IsString({ each: true })
  notificationTimes: string[];

  @IsDateString()
  startDate: string;

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
}
