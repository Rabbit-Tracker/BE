import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';
import { FriendsService } from './friends.service.js';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('my-code')
  getMyCode(@CurrentUser() user: CurrentUserPayload): { code: string } {
    const code = this.friendsService.getMyFriendCode(user.id);
    return { code };
  }

  @Get('recommendations')
  getRecommendations(@CurrentUser() user: CurrentUserPayload) {
    return this.friendsService.getRecommendations(user.id);
  }

  @Get('following')
  getFollowing(@CurrentUser() user: CurrentUserPayload) {
    return this.friendsService.getFollowing(user.id);
  }

  @Get('followers')
  getFollowers(@CurrentUser() user: CurrentUserPayload) {
    return this.friendsService.getFollowers(user.id);
  }

  @Get('search')
  search(@CurrentUser() user: CurrentUserPayload, @Query('q') q?: string) {
    return this.friendsService.search(user.id, q ?? '');
  }

  @Get(':id')
  getFriend(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.friendsService.getFriendById(user.id, id);
  }

  @Get(':id/today-progress')
  getFriendTodayProgress(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.friendsService.getFriendTodayProgress(user.id, id);
  }

  @Get(':id/contribution')
  getFriendContribution(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Query('days') days?: string,
  ) {
    const parsed = Number(days ?? '150');
    const safeDays = Number.isFinite(parsed) && parsed > 0 && parsed <= 365 ? parsed : 150;
    return this.friendsService.getFriendContribution(user.id, id, safeDays);
  }

  @Get(':id/habits')
  getFriendHabits(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.friendsService.getFriendHabits(user.id, id);
  }

  @Get(':id/checks')
  getFriendChecks(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.friendsService.getFriendChecks(user.id, id, from, to);
  }

  @Post(':id/follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  async follow(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string): Promise<void> {
    await this.friendsService.follow(user.id, id);
  }

  @Delete(':id/follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfollow(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string): Promise<void> {
    await this.friendsService.unfollow(user.id, id);
  }
}
