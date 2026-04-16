import { IsBoolean, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

export class UpdateMyNotificationSettingDto {
  @IsOptional()
  @IsBoolean()
  isPushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isWeeklyReportEnabled?: boolean;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'doNotDisturbStart는 HH:mm 형식이어야 해.' })
  doNotDisturbStart?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'doNotDisturbEnd는 HH:mm 형식이어야 해.' })
  doNotDisturbEnd?: string | null;
}
