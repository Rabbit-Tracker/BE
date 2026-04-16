import { IsBoolean, IsIn, IsOptional } from 'class-validator';

const CONTRIBUTION_VISIBILITY = ['all', 'friends', 'none'] as const;

export class UpdateMyPrivacySettingDto {
  @IsOptional()
  @IsBoolean()
  todayProgressFriendsOnly?: boolean;

  @IsOptional()
  @IsIn(CONTRIBUTION_VISIBILITY, {
    message: 'contributionVisibility는 all, friends, none 중 하나여야 해.',
  })
  contributionVisibility?: (typeof CONTRIBUTION_VISIBILITY)[number];
}
