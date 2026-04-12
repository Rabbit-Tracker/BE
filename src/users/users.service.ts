import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { User } from '../entities/user.entity.js';
import { UserAuthProvider } from '../entities/user-auth-provider.entity.js';
import { UserSession } from '../entities/user-session.entity.js';
import { OAuthProfileDto } from '../auth/dto/oauth-profile.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserAuthProvider)
    private readonly authProviderRepo: Repository<UserAuthProvider>,
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByProvider(provider: string, providerUserId: string): Promise<UserAuthProvider | null> {
    return this.authProviderRepo.findOne({
      where: { provider, providerUserId },
      relations: ['user'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async createWithProvider(profile: OAuthProfileDto): Promise<{ user: User; isNewUser: boolean }> {
    return this.dataSource.transaction(async (manager) => {
      // 이메일이 있으면 기존 유저 검색 (계정 연동)
      let user: User | null = null;
      let isNewUser = false;

      if (profile.email) {
        user = await manager.findOne(User, {
          where: { email: profile.email },
        });
      }

      if (!user) {
        user = manager.create(User, {
          nickname: profile.nickname,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
        });
        user = await manager.save(User, user);
        isNewUser = true;
      }

      const authProvider = manager.create(UserAuthProvider, {
        userId: user.id,
        provider: profile.provider,
        providerUserId: profile.providerUserId,
        email: profile.email,
      });
      await manager.save(UserAuthProvider, authProvider);

      return { user, isNewUser };
    });
  }

  async createSession(
    sessionId: string,
    userId: string,
    refreshTokenHash: string,
    expiresAt: Date,
    userAgent?: string,
  ): Promise<UserSession> {
    const session = this.sessionRepo.create({
      id: sessionId,
      userId,
      refreshTokenHash,
      expiresAt,
      lastUsedAt: new Date(),
      userAgent: userAgent ?? null,
    });
    return this.sessionRepo.save(session);
  }

  async findSessionById(sessionId: string): Promise<UserSession | null> {
    return this.sessionRepo.findOne({ where: { id: sessionId } });
  }

  async updateSession(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
    userAgent?: string | null,
  ): Promise<void> {
    await this.sessionRepo.update(sessionId, {
      refreshTokenHash,
      expiresAt,
      lastUsedAt: new Date(),
      ...(typeof userAgent === 'string' ? { userAgent } : {}),
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.sessionRepo.delete(sessionId);
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepo.delete({ userId });
  }

  async updateById(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }

    if (user.status !== 'active') {
      throw new BadRequestException('활성 상태의 계정만 수정할 수 있습니다');
    }

    const updatedUser = this.userRepo.merge(user, {
      ...updateUserDto,
      // 빈 문자열은 DB에 저장하지 않고 null로 정규화
      avatarUrl:
        updateUserDto.avatarUrl === undefined
          ? user.avatarUrl
          : updateUserDto.avatarUrl === ''
            ? null
            : updateUserDto.avatarUrl,
      avatarEmoji:
        updateUserDto.avatarEmoji === undefined
          ? user.avatarEmoji
          : updateUserDto.avatarEmoji === ''
            ? null
            : updateUserDto.avatarEmoji,
    });

    return this.userRepo.save(updatedUser);
  }

  async removeById(userId: string): Promise<{ ok: true }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, { id: userId }, { status: 'deleted' });
      await manager.delete(UserSession, { userId });
      await manager.softDelete(User, { id: userId });
    });

    return { ok: true };
  }
}
