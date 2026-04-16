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
