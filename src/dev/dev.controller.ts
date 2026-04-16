import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';
import { Follow } from '../entities/follow.entity.js';
import { User } from '../entities/user.entity.js';

@Controller('dev')
@UseGuards(JwtAuthGuard)
export class DevController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
  ) {}

  /**
   * 개발용: 더미 친구(유저) 생성 + (옵션) 내 계정에서 자동 팔로우.
   * - 앱에서 버튼 한 번으로 친구 기능 데모 가능하게 하기 위함
   */
  @Post('seed-dummy-friends')
  async seedDummyFriends(
    @CurrentUser() user: CurrentUserPayload,
    @Query('following') following: string | undefined,
    @Query('followers') followers: string | undefined,
  ): Promise<{
    created: number;
    followingAdded: number;
    followersAdded: number;
    followingUserIds: string[];
    followerUserIds: string[];
  }> {
    const followingCount = Math.max(0, Math.min(30, Number(following ?? '5') || 0));
    const followersCount = Math.max(0, Math.min(30, Number(followers ?? '5') || 0));

    const nicknames = [
      '성실러',
      '아침형',
      '밤코딩',
      '운동광',
      '책벌레',
      'JS마스터',
      '타입러',
      'Next짱',
      'React꿈나무',
      '코테중독',
      '러닝맨',
      '집중왕',
      '몰입러',
      '루틴장인',
      '꾸준함',
    ];
    const emojis = ['🐰', '🧠', '🏃', '📚', '🧘', '🧩', '🧑‍💻', '☕️', '🌱', '🔥'];

    let created = 0;
    const dummyUserIds: string[] = [];

    for (let i = 1; i <= 30; i += 1) {
      const email = `dummy_user_${String(i).padStart(3, '0')}@example.com`;
      const existing = await this.userRepo.findOne({ where: { email } });
      if (existing) {
        dummyUserIds.push(existing.id);
        continue;
      }
      const newUser = this.userRepo.create({
        nickname: `${nicknames[(i - 1) % nicknames.length]}${i}`,
        email,
        avatarEmoji: emojis[(i - 1) % emojis.length],
        avatarUrl: null,
        isPrivate: i % 12 === 0,
        status: 'active',
        timezone: 'Asia/Seoul',
      });
      const saved = await this.userRepo.save(newUser);
      created += 1;
      dummyUserIds.push(saved.id);
    }

    // 내 계정 → 더미 유저 (팔로잉)
    // 팔로잉/팔로워가 "맞팔"처럼 전부 겹치지 않도록, 서로 다른 집합으로 나눈다.
    const candidateIds = dummyUserIds.filter((id) => id !== user.id);
    const followingUserIds = candidateIds.slice(0, followingCount);
    let followingAdded = 0;
    for (const dummyId of followingUserIds) {
      if (dummyId === user.id) continue;
      const exists = await this.followRepo.findOne({
        where: { followerId: user.id, followingId: dummyId },
      });
      if (exists) continue;
      await this.followRepo.save(
        this.followRepo.create({ followerId: user.id, followingId: dummyId }),
      );
      followingAdded += 1;
    }

    // 더미 유저 → 내 계정 (팔로워)
    const followerUserIds = candidateIds.slice(followingCount, followingCount + followersCount);
    let followersAdded = 0;
    for (const dummyId of followerUserIds) {
      if (dummyId === user.id) continue;
      const exists = await this.followRepo.findOne({
        where: { followerId: dummyId, followingId: user.id },
      });
      if (exists) continue;
      await this.followRepo.save(
        this.followRepo.create({ followerId: dummyId, followingId: user.id }),
      );
      followersAdded += 1;
    }

    return { created, followingAdded, followersAdded, followingUserIds, followerUserIds };
  }
}
