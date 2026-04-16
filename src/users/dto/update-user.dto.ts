import {
  IsBoolean,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 30, { message: '닉네임은 1자 이상 30자 이하여야 합니다' })
  @Matches(/^\S(?:.*\S)?$/, { message: '닉네임 앞뒤 공백은 허용되지 않습니다' })
  nickname?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'avatarUrl은 http 또는 https URL이어야 합니다' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10, { message: '아바타 이모지는 1자 이상 10자 이하여야 합니다' })
  avatarEmoji?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  @IsTimeZone({ message: 'timezone은 유효한 IANA Timezone이어야 합니다' })
  timezone?: string;
}
