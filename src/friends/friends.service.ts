import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { createHash } from 'crypto';

import { Follow } from '../entities/follow.entity.js';
import { HabitCheck } from '../entities/habit-check.entity.js';
import { Habit } from '../entities/habit.entity.js';
import { User } from '../entities/user.entity.js';

export type FriendCardDto = {
  userId: string;
  nickname: string;
  email: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
  isFollowing: boolean;
  isFollower: boolean;
};

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    @InjectRepository(Habit) private readonly habitRepo: Repository<Habit>,
    @InjectRepository(HabitCheck) private readonly checkRepo: Repository<HabitCheck>,
  ) {}

  getMyFriendCode(userId: string): string {
    // DB 컬럼 없이도 재현 가능한 코드 (6자리) — userId 기반 해시
    const hash = createHash('sha1').update(userId).digest('hex').toUpperCase();
    // 혼동 적은 문자셋으로 매핑
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i += 1) {
      const byte = parseInt(hash.slice(i * 2, i * 2 + 2), 16);
      code += chars[byte % chars.length];
    }
    return code;
  }

  private async getRelationSets(currentUserId: string): Promise<{
    followingIds: Set<string>;
    followerIds: Set<string>;
  }> {
    const follows = await this.followRepo.find({
      where: [{ followerId: currentUserId }, { followingId: currentUserId }],
    });

    const followingIds = new Set<string>();
    const followerIds = new Set<string>();

    for (const f of follows) {
      if (f.followerId === currentUserId) followingIds.add(f.followingId);
      if (f.followingId === currentUserId) followerIds.add(f.followerId);
    }

    return { followingIds, followerIds };
  }

  private toCardDto(
    user: User,
    relation: { followingIds: Set<string>; followerIds: Set<string> },
  ): FriendCardDto {
    return {
      userId: user.id,
      nickname: user.nickname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      isFollowing: relation.followingIds.has(user.id),
      isFollower: relation.followerIds.has(user.id),
    };
  }

  async getRecommendations(currentUserId: string): Promise<FriendCardDto[]> {
    const relation = await this.getRelationSets(currentUserId);
    const users = await this.userRepo.find({
      where: { id: Not(currentUserId), status: 'active', deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: 200,
    });
    // 이미 팔로우 중인 유저는 추천에서 제외 (추천 탭에서 안 보이게)
    return users
      .filter((u) => !relation.followingIds.has(u.id))
      .map((u) => this.toCardDto(u, relation));
  }

  async getFollowing(currentUserId: string): Promise<FriendCardDto[]> {
    const relation = await this.getRelationSets(currentUserId);
    const followRows = await this.followRepo.find({ where: { followerId: currentUserId } });
    const ids = followRows.map((f) => f.followingId);
    if (ids.length === 0) return [];
    const users = await this.userRepo.find({
      where: { id: In(ids), status: 'active', deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => this.toCardDto(u, relation));
  }

  async getFollowers(currentUserId: string): Promise<FriendCardDto[]> {
    const relation = await this.getRelationSets(currentUserId);
    const followRows = await this.followRepo.find({ where: { followingId: currentUserId } });
    const ids = followRows.map((f) => f.followerId);
    if (ids.length === 0) return [];
    const users = await this.userRepo.find({
      where: { id: In(ids), status: 'active', deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => this.toCardDto(u, relation));
  }

  async search(currentUserId: string, query: string): Promise<FriendCardDto[]> {
    const q = query.trim();
    if (!q) return [];
    const relation = await this.getRelationSets(currentUserId);

    // 단순 LIKE 검색 (nickname/email). 규모 작다고 가정.
    const users = await this.userRepo
      .createQueryBuilder('u')
      .where('u.deletedAt IS NULL')
      .andWhere('u.status = :status', { status: 'active' })
      .andWhere('u.id != :me', { me: currentUserId })
      .andWhere('(u.nickname ILIKE :q OR u.email ILIKE :q)', { q: `%${q}%` })
      .orderBy('u.createdAt', 'DESC')
      .limit(50)
      .getMany();

    return users.map((u) => this.toCardDto(u, relation));
  }

  async getFriendById(currentUserId: string, friendUserId: string): Promise<FriendCardDto | null> {
    if (!friendUserId) return null;
    const relation = await this.getRelationSets(currentUserId);
    const user = await this.userRepo.findOne({
      where: { id: friendUserId, status: 'active', deletedAt: IsNull() },
    });
    if (!user) return null;
    return this.toCardDto(user, relation);
  }

  async follow(currentUserId: string, targetUserId: string): Promise<void> {
    if (!targetUserId || targetUserId === currentUserId) return;
    const existing = await this.followRepo.findOne({
      where: { followerId: currentUserId, followingId: targetUserId },
    });
    if (existing) return;
    await this.followRepo.save(
      this.followRepo.create({ followerId: currentUserId, followingId: targetUserId }),
    );
  }

  async unfollow(currentUserId: string, targetUserId: string): Promise<void> {
    if (!targetUserId || targetUserId === currentUserId) return;
    await this.followRepo.delete({ followerId: currentUserId, followingId: targetUserId });
  }

  private toDateKeyLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private isHabitApplicableOnDate(habit: Habit, dateOnly: Date): boolean {
    if (habit.status !== 'active') return false;
    if (habit.archivedAt) return false;

    const dateKey = this.toDateKeyLocal(dateOnly);

    const startDate = new Date(habit.startDate);
    startDate.setHours(0, 0, 0, 0);
    if (dateOnly < startDate) return false;

    if (habit.endDate) {
      const endDate = new Date(habit.endDate);
      endDate.setHours(0, 0, 0, 0);
      if (dateOnly > endDate) return false;
    }

    if (habit.excludedDates?.includes(dateKey)) return false;

    if (habit.frequency === 'weekly') {
      if (!habit.selectedDays || habit.selectedDays.length === 0) return false;
      return habit.selectedDays.includes(dateOnly.getDay());
    }

    if (habit.frequency === 'once') {
      return startDate.getTime() === dateOnly.getTime();
    }

    return true;
  }

  private async canViewFriendData(viewerId: string, friendUserId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: friendUserId, status: 'active', deletedAt: IsNull() },
    });
    if (!user) return false;
    if (!user.isPrivate) return true;
    // 비공개 계정은 "내가 팔로우 중"일 때만 상세 데이터 공개
    const followRow = await this.followRepo.findOne({
      where: { followerId: viewerId, followingId: friendUserId },
    });
    return !!followRow;
  }

  async getFriendHabits(viewerId: string, friendUserId: string): Promise<Habit[] | null> {
    const canView = await this.canViewFriendData(viewerId, friendUserId);
    if (!canView) return null;
    const habits = await this.habitRepo.find({ where: { userId: friendUserId } });
    // 친구 상세에는 "활성 + 미보관"만 노출 (보관 습관은 원칙적으로 숨김)
    return habits.filter((h) => h.status === 'active' && !h.archivedAt);
  }

  async getFriendChecks(
    viewerId: string,
    friendUserId: string,
    fromDateKey?: string,
    toDateKey?: string,
  ): Promise<HabitCheck[] | null> {
    const canView = await this.canViewFriendData(viewerId, friendUserId);
    if (!canView) return null;

    // 날짜 파싱(YYYY-MM-DD). 유효하지 않으면 전체(제한 없음)로 감.
    const parse = (key?: string): Date | null => {
      if (!key) return null;
      const [y, m, d] = key.split('-').map((v) => Number(v));
      if (!y || !m || !d) return null;
      const dt = new Date(y, m - 1, d);
      dt.setHours(0, 0, 0, 0);
      return dt;
    };
    const from = parse(fromDateKey);
    const to = parse(toDateKey);

    if (!from || !to) {
      return this.checkRepo.find({ where: { userId: friendUserId } });
    }

    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);

    return this.checkRepo
      .createQueryBuilder('c')
      .where('c.userId = :userId', { userId: friendUserId })
      .andWhere('c.checkDate BETWEEN :from AND :to', { from, to: toEnd })
      .getMany();
  }

  async getFriendTodayProgress(
    viewerId: string,
    friendUserId: string,
  ): Promise<{
    completed: number;
    total: number;
  } | null> {
    const canView = await this.canViewFriendData(viewerId, friendUserId);
    if (!canView) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = this.toDateKeyLocal(today);

    const habits = await this.habitRepo.find({ where: { userId: friendUserId } });
    const applicableHabits = habits.filter((h) => this.isHabitApplicableOnDate(h, today));

    const checks = await this.checkRepo.find({ where: { userId: friendUserId } });

    let completed = 0;
    for (const habit of applicableHabits) {
      if (habit.notificationTimes.length > 0) {
        const allChecked = habit.notificationTimes.every((time) =>
          checks.some(
            (c) =>
              c.habitId === habit.id &&
              this.toDateKeyLocal(new Date(c.checkDate)) === todayKey &&
              c.notificationTime === time &&
              c.isChecked,
          ),
        );
        if (allChecked) completed += 1;
      } else {
        const checked = checks.some(
          (c) =>
            c.habitId === habit.id &&
            this.toDateKeyLocal(new Date(c.checkDate)) === todayKey &&
            c.notificationTime == null &&
            c.isChecked,
        );
        if (checked) completed += 1;
      }
    }

    return { completed, total: applicableHabits.length };
  }

  async getFriendContribution(
    viewerId: string,
    friendUserId: string,
    days: number,
  ): Promise<Record<string, 0 | 1 | 2 | 3 | 4> | null> {
    const canView = await this.canViewFriendData(viewerId, friendUserId);
    if (!canView) return null;

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    const habits = await this.habitRepo.find({ where: { userId: friendUserId } });
    const checks = await this.checkRepo.find({ where: { userId: friendUserId } });

    // "한 일 수" 기반: 그날 체크된 습관 id 개수(중복 제거) / 기간 내 max로 레벨
    const countMap: Record<string, number> = {};
    const cur = new Date(start);
    while (cur <= end) {
      const dateKey = this.toDateKeyLocal(cur);
      const applicableIds = new Set(
        habits.filter((h) => this.isHabitApplicableOnDate(h, cur)).map((h) => h.id),
      );
      const completedIds = new Set(
        checks
          .filter((c) => c.isChecked && applicableIds.has(c.habitId))
          .filter((c) => this.toDateKeyLocal(new Date(c.checkDate)) === dateKey)
          .map((c) => c.habitId),
      );
      countMap[dateKey] = completedIds.size;
      cur.setDate(cur.getDate() + 1);
    }

    const maxCompleted = Math.max(0, ...Object.values(countMap));
    const toLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
      if (maxCompleted === 0 || count === 0) return 0;
      const ratio = count / maxCompleted;
      if (ratio <= 0.25) return 1;
      if (ratio <= 0.5) return 2;
      if (ratio <= 0.75) return 3;
      return 4;
    };

    const result: Record<string, 0 | 1 | 2 | 3 | 4> = {};
    for (const [k, v] of Object.entries(countMap)) {
      result[k] = toLevel(v);
    }
    return result;
  }
}
