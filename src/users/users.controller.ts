import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { User } from '../entities/user.entity.js';
import { UpdateMyNotificationSettingDto } from './dto/update-my-notification-setting.dto.js';
import { UpdateMyPrivacySettingDto } from './dto/update-my-privacy-setting.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/notification-setting')
  @ApiOperation({ summary: '내 알림 설정 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getMyNotificationSetting(@Req() req: AuthenticatedRequest) {
    return this.usersService.getOrCreateNotificationSetting(req.user.id);
  }

  @Patch('me/notification-setting')
  @ApiOperation({ summary: '내 알림 설정 수정' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  patchMyNotificationSetting(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateMyNotificationSettingDto,
  ) {
    return this.usersService.updateNotificationSetting(req.user.id, dto);
  }

  @Get('me/privacy-setting')
  @ApiOperation({ summary: '내 공개 범위 설정 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getMyPrivacySetting(@Req() req: AuthenticatedRequest) {
    return this.usersService.getOrCreatePrivacySetting(req.user.id);
  }

  @Patch('me/privacy-setting')
  @ApiOperation({ summary: '내 공개 범위 설정 수정' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  patchMyPrivacySetting(@Req() req: AuthenticatedRequest, @Body() dto: UpdateMyPrivacySettingDto) {
    return this.usersService.updatePrivacySetting(req.user.id, dto);
  }

  @Patch('me')
  @ApiOperation({ summary: '내 프로필 수정' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      profileUpdate: {
        summary: '닉네임/아바타/타임존 수정 예시',
        value: {
          nickname: '토끼러너',
          avatarUrl: 'https://example.com/avatar.png',
          avatarEmoji: '🐰',
          isPrivate: false,
          timezone: 'Asia/Seoul',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '프로필 수정 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '유저를 찾을 수 없음' })
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // JWT 검증을 통과한 요청만 들어오므로 req.user.id를 신뢰할 수 있음

    return await this.usersService.updateById(req.user.id, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({ summary: '내 계정 삭제(탈퇴)' })
  @ApiResponse({ status: 200, description: '계정 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '유저를 찾을 수 없음' })
  async removeMe(@Req() req: AuthenticatedRequest): Promise<{ ok: true }> {
    // 탈퇴 시 현재 유저의 세션을 정리하고 계정을 소프트 삭제

    return await this.usersService.removeById(req.user.id);
  }
}
