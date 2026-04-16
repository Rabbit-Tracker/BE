import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';
import { Follow } from '../entities/follow.entity.js';
import { HabitCheck } from '../entities/habit-check.entity.js';
import { Habit } from '../entities/habit.entity.js';
import { User } from '../entities/user.entity.js';

@Controller('dev')
@UseGuards(JwtAuthGuard)
export class DevController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    @InjectRepository(Habit) private readonly habitRepo: Repository<Habit>,
    @InjectRepository(HabitCheck) private readonly checkRepo: Repository<HabitCheck>,
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

  /**
   * 개발용: "데이터있는친구" 유저 1명 생성 + 습관/체크 데이터 시드.
   * - 친구 상세 화면에서 공개/비공개 케이스를 확인하기 위함
   */
  @Post('seed-data-friend')
  async seedDataFriend(
    @CurrentUser() user: CurrentUserPayload,
    @Query('isPrivate') isPrivate?: string,
    @Query('follow') follow?: string,
  ): Promise<{ userId: string; created: boolean }> {
    const privateFlag = isPrivate === 'true';
    const shouldFollow = follow !== 'false';

    const email = `data_friend_${privateFlag ? 'private' : 'public'}@example.com`;
    let friend = await this.userRepo.findOne({ where: { email } });
    let created = false;
    if (!friend) {
      friend = await this.userRepo.save(
        this.userRepo.create({
          nickname: '데이터있는친구',
          email,
          avatarEmoji: privateFlag ? '🔒' : '📊',
          avatarUrl: null,
          isPrivate: privateFlag,
          status: 'active',
          timezone: 'Asia/Seoul',
        }),
      );
      created = true;
    }

    // 습관 데이터가 없으면 생성
    const existingHabits = await this.habitRepo.find({ where: { userId: friend.id } });
    if (existingHabits.length === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 10);

      const habit1 = await this.habitRepo.save(
        this.habitRepo.create({
          userId: friend.id,
          categoryId: null,
          name: '물 8잔',
          description: null,
          frequency: 'daily',
          frequencyDetail: null,
          selectedDays: null,
          notificationTimes: [],
          startDate,
          endDate: null,
          excludedDates: null,
          icon: '💧',
          status: 'active',
          archivedAt: null,
        }),
      );
      const habit2 = await this.habitRepo.save(
        this.habitRepo.create({
          userId: friend.id,
          categoryId: null,
          name: '10분 스트레칭',
          description: null,
          frequency: 'daily',
          frequencyDetail: null,
          selectedDays: null,
          notificationTimes: [],
          startDate,
          endDate: null,
          excludedDates: null,
          icon: '🧘',
          status: 'active',
          archivedAt: null,
        }),
      );
      const habit3 = await this.habitRepo.save(
        this.habitRepo.create({
          userId: friend.id,
          categoryId: null,
          name: '영어 단어 20개',
          description: null,
          frequency: 'daily',
          frequencyDetail: null,
          selectedDays: null,
          notificationTimes: [],
          startDate,
          endDate: null,
          excludedDates: null,
          icon: '📚',
          status: 'active',
          archivedAt: null,
        }),
      );

      // 최근 14일 체크 시드 (랜덤)
      const habits = [habit1, habit2, habit3];
      for (let i = 0; i < 14; i += 1) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        for (const h of habits) {
          const checked = Math.random() > 0.35; // 65% 정도 체크
          if (!checked) continue;
          await this.checkRepo.save(
            this.checkRepo.create({
              habitId: h.id,
              userId: friend.id,
              checkDate: d,
              isChecked: true,
              checkedAt: new Date(),
              notificationTime: null,
            }),
          );
        }
      }
    }

    if (shouldFollow) {
      const existing = await this.followRepo.findOne({
        where: { followerId: user.id, followingId: friend.id },
      });
      if (!existing) {
        await this.followRepo.save(
          this.followRepo.create({ followerId: user.id, followingId: friend.id }),
        );
      }
    }

    return { userId: friend.id, created };
  }
}
