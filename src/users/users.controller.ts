import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';
import { UsersService } from './users.service.js';

type RecommendedUserDto = {
  userId: string;
  nickname: string;
  email: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
};

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 추천 친구 후보 목록(일단 전체 유저).
   * - 내 계정은 제외
   * - 삭제/비활성 유저는 제외
   */
  @Get('recommendations')
  async getRecommendations(@CurrentUser() user: CurrentUserPayload): Promise<RecommendedUserDto[]> {
    const users = await this.usersService.findRecommendationCandidates(user.id);
    return users.map((u) => ({
      userId: u.id,
      nickname: u.nickname,
      email: u.email,
      avatarUrl: u.avatarUrl,
      isPrivate: u.isPrivate,
    }));
  }
}
