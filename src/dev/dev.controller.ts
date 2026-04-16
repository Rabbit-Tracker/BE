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
    @Query('follow') follow: string | undefined,
  ): Promise<{ created: number; followed: number }> {
    const shouldFollow = follow === 'true';

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

    let followed = 0;
    if (shouldFollow) {
      for (const dummyId of dummyUserIds) {
        if (dummyId === user.id) continue;
        const exists = await this.followRepo.findOne({
          where: { followerId: user.id, followingId: dummyId },
        });
        if (exists) continue;
        await this.followRepo.save(
          this.followRepo.create({ followerId: user.id, followingId: dummyId }),
        );
        followed += 1;
      }
    }

    return { created, followed };
  }
}
