import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertCheckDto {
  @IsDateString()
  checkDate: string;

  @IsBoolean()
  isChecked: boolean;

  @IsDateString()
  checkedAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  notificationTime?: string;
}
