import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Habit } from '../entities/habit.entity';
import { HabitCategory } from '../entities/habit-category.entity';
import { HabitCheck } from '../entities/habit-check.entity';
import {
  CategoryProgressItemDto,
  CategoryProgressResponseDto,
} from './dto/category-progress-response.dto';
import { ContributionResponseDto } from './dto/contribution-response.dto';
import {
  DailyProgressDto,
  DateRangeProgressResponseDto,
} from './dto/date-range-progress-response.dto';
import { HabitStreakItemDto, StreakResponseDto } from './dto/streak-response.dto';
import { TodayProgressResponseDto } from './dto/today-progress-response.dto';

type ContributionLevel = 0 | 1 | 2 | 3 | 4;

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepo: Repository<Habit>,

    @InjectRepository(HabitCheck)
    private readonly checkRepo: Repository<HabitCheck>,

    @InjectRepository(HabitCategory)
    private readonly categoryRepo: Repository<HabitCategory>,
  ) {}

  // ──────────────────────────────────────────
  // 1. 오늘 달성률
  // ──────────────────────────────────────────

  async getTodayProgress(userId: string): Promise<TodayProgressResponseDto> {
    const today = this.todayKST();
    const habits = await this.getActiveHabits(userId);
    const checks = await this.getChecksForDate(userId, today);

    let completed = 0;
    for (const habit of habits) {
      if (
        this.isHabitApplicableOnDate(habit, today) &&
        this.isHabitCompletedOnDate(habit, checks)
      ) {
        completed++;
      }
    }

    const applicableTotal = habits.filter((h) => this.isHabitApplicableOnDate(h, today)).length;

    return {
      completed,
      total: applicableTotal,
      rate: this.calcRate(completed, applicableTotal),
    };
  }

  // ──────────────────────────────────────────
  // 2. 주간 달성률
  // ──────────────────────────────────────────

  async getWeeklyProgress(
    userId: string,
    baseDate?: string,
  ): Promise<DateRangeProgressResponseDto> {
    const end = baseDate ? this.parseKSTDate(baseDate) : this.todayKST();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return this.getProgressForDateRange(userId, start, end);
  }

  // ──────────────────────────────────────────
  // 3. 월간 달성률
  // ──────────────────────────────────────────

  async getMonthlyProgress(
    userId: string,
    baseDate?: string,
  ): Promise<DateRangeProgressResponseDto> {
    const end = baseDate ? this.parseKSTDate(baseDate) : this.todayKST();
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    return this.getProgressForDateRange(userId, start, end);
  }

  // ──────────────────────────────────────────
  // 4. 카테고리별 달성률
  // ──────────────────────────────────────────

  async getCategoryProgress(
    userId: string,
    period: 'week' | 'month',
    categoryId?: string,
  ): Promise<CategoryProgressResponseDto> {
    const today = this.todayKST();
    const periodDays = period === 'week' ? 7 : 30;
    const start = new Date(today);
    start.setDate(start.getDate() - (periodDays - 1));

    const habits = await this.getActiveHabits(userId);
    const checks = await this.getChecksInRange(userId, start, today);
    const categories = await this.categoryRepo.find({
      where: { userId },
      order: { sortOrder: 'ASC' },
    });

    // 카테고리별 그룹핑
    const categoryMap = new Map<string | null, Habit[]>();
    for (const habit of habits) {
      const key = habit.categoryId;
      if (!categoryMap.has(key)) categoryMap.set(key, []);
      categoryMap.get(key)!.push(habit);
    }

    // 특정 카테고리만 필터
    if (categoryId !== undefined) {
      const filtered = new Map<string | null, Habit[]>();
      const key = categoryId === 'null' ? null : categoryId;
      if (categoryMap.has(key)) {
        filtered.set(key, categoryMap.get(key)!);
      }
      categoryMap.clear();
      for (const [k, v] of filtered) categoryMap.set(k, v);
    }

    const items: CategoryProgressItemDto[] = [];

    for (const [catId, catHabits] of categoryMap) {
      const cat = categories.find((c) => c.id === catId);
      let completed = 0;
      let total = 0;

      // 기간 내 날짜 순회
      const cur = new Date(start);
      while (cur <= today) {
        const dateStr = this.toDateKey(cur);
        const dayChecks = checks.filter(
          (c) => this.toDateKey(c.checkDate) === dateStr && c.isChecked,
        );

        for (const habit of catHabits) {
          if (this.isHabitApplicableOnDate(habit, cur)) {
            total++;
            if (this.isHabitCompletedOnDate(habit, dayChecks)) {
              completed++;
            }
          }
        }
        cur.setDate(cur.getDate() + 1);
      }

      items.push({
        categoryId: catId,
        categoryName: cat?.name ?? '미분류',
        categoryIcon: cat?.icon ?? null,
        completed,
        total,
        rate: this.calcRate(completed, total),
      });
    }

    // rate 기준 정렬
    items.sort((a, b) => b.rate - a.rate);

    const itemsWithTotal = items.filter((i) => i.total > 0);

    return {
      period,
      categories: items,
      bestCategory: itemsWithTotal.length > 0 ? itemsWithTotal[0] : null,
      worstCategory: itemsWithTotal.length > 0 ? itemsWithTotal[itemsWithTotal.length - 1] : null,
    };
  }

  // ──────────────────────────────────────────
  // 5. 연속 달성일(스트릭)
  // ──────────────────────────────────────────

  async getStreaks(userId: string): Promise<StreakResponseDto> {
    const habits = await this.getActiveHabits(userId);

    // 최근 1000일치 체크 조회
    const rangeStart = new Date(this.todayKST());
    rangeStart.setDate(rangeStart.getDate() - 1000);
    const allChecks = await this.getChecksInRange(userId, rangeStart, this.todayKST());

    const habitItems: HabitStreakItemDto[] = habits.map((habit) => {
      const habitChecks = allChecks.filter((c) => c.habitId === habit.id);
      return {
        habitId: habit.id,
        habitName: habit.name,
        habitIcon: habit.icon,
        currentStreak: this.calculateCurrentStreak(habit, habitChecks),
        bestStreak: this.calculateBestStreak(habit, habitChecks),
      };
    });

    // 전체 종합 스트릭: 모든 활성 습관이 해당 날짜에 100% 완료된 연속일
    const overallCurrentStreak = this.calculateOverallCurrentStreak(habits, allChecks);
    const overallBestStreak = this.calculateOverallBestStreak(habits, allChecks);

    return {
      overallCurrentStreak,
      overallBestStreak,
      habits: habitItems,
    };
  }

  // ──────────────────────────────────────────
  // 6. 기여도(잔디)
  // ──────────────────────────────────────────

  async getContributions(userId: string, days: number = 150): Promise<ContributionResponseDto> {
    const today = this.todayKST();
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));

    const habits = await this.getActiveHabits(userId);
    const checks = await this.getChecksInRange(userId, start, today);

    const contributions: Record<string, ContributionLevel> = {};
    const cur = new Date(start);

    while (cur <= today) {
      const dateStr = this.toDateKey(cur);
      const dayChecks = checks.filter(
        (c) => this.toDateKey(c.checkDate) === dateStr && c.isChecked,
      );

      const applicableHabits = habits.filter((h) => this.isHabitApplicableOnDate(h, cur));
      let completed = 0;
      for (const habit of applicableHabits) {
        if (this.isHabitCompletedOnDate(habit, dayChecks)) {
          completed++;
        }
      }

      const ratio = applicableHabits.length === 0 ? 0 : completed / applicableHabits.length;
      contributions[dateStr] = this.ratioToLevel(ratio);
      cur.setDate(cur.getDate() + 1);
    }

    return { days, contributions };
  }

  // ══════════════════════════════════════════
  // 내부 헬퍼 메서드
  // ══════════════════════════════════════════

  /** 활성 습관 목록 조회 (status=active, soft delete 제외) */
  private async getActiveHabits(userId: string): Promise<Habit[]> {
    return this.habitRepo.find({
      where: { userId, status: 'active' },
    });
  }

  /** 특정 날짜의 체크 목록 조회 */
  private async getChecksForDate(userId: string, date: Date): Promise<HabitCheck[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return this.checkRepo.find({
      where: {
        userId,
        checkDate: Between(start, end),
      },
    });
  }

  /** 기간 내 체크 목록 조회 */
  private async getChecksInRange(userId: string, start: Date, end: Date): Promise<HabitCheck[]> {
    const rangeStart = new Date(start);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(end);
    rangeEnd.setHours(23, 59, 59, 999);

    return this.checkRepo.find({
      where: {
        userId,
        checkDate: Between(rangeStart, rangeEnd),
      },
    });
  }

  /** 해당 날짜에 습관이 적용 가능한지 (체크 대상인지) */
  private isHabitApplicableOnDate(habit: Habit, date: Date): boolean {
    const habitStart = new Date(habit.startDate);
    habitStart.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    if (d < habitStart) return false;
    if (habit.frequency === 'once') return false;

    if (habit.frequency === 'weekly' && habit.selectedDays?.length) {
      return habit.selectedDays.includes(d.getDay());
    }

    // daily 또는 weekly(유연 빈도) → 매일 적용
    return true;
  }

  /** 습관이 해당 날짜에 완료되었는지 (notificationTimes 고려) */
  private isHabitCompletedOnDate(habit: Habit, checksForDate: HabitCheck[]): boolean {
    const habitChecks = checksForDate.filter((c) => c.habitId === habit.id);

    if (habit.notificationTimes && habit.notificationTimes.length > 0) {
      // 모든 알림 시간이 체크되어야 완료
      return habit.notificationTimes.every((time) =>
        habitChecks.some((c) => c.notificationTime === time && c.isChecked),
      );
    }

    // 알림시간 없는 습관: notificationTime이 null인 체크가 있으면 완료
    return habitChecks.some((c) => c.notificationTime == null && c.isChecked);
  }

  /** 주간/월간 공용: 기간 내 일별 진행률 계산 */
  private async getProgressForDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<DateRangeProgressResponseDto> {
    const habits = await this.getActiveHabits(userId);
    const checks = await this.getChecksInRange(userId, start, end);

    const days: DailyProgressDto[] = [];
    const cur = new Date(start);

    while (cur <= end) {
      const dateStr = this.toDateKey(cur);
      const dayChecks = checks.filter(
        (c) => this.toDateKey(c.checkDate) === dateStr && c.isChecked,
      );

      const applicableHabits = habits.filter((h) => this.isHabitApplicableOnDate(h, cur));
      let completed = 0;
      for (const habit of applicableHabits) {
        if (this.isHabitCompletedOnDate(habit, dayChecks)) {
          completed++;
        }
      }

      days.push({
        date: dateStr,
        completed,
        total: applicableHabits.length,
        rate: this.calcRate(completed, applicableHabits.length),
      });

      cur.setDate(cur.getDate() + 1);
    }

    const totalRate = days.reduce((sum, d) => sum + d.rate, 0);
    const averageRate = days.length === 0 ? 0 : Math.round((totalRate / days.length) * 10) / 10;

    return { days, averageRate };
  }

  // ──────────────────────────────────────────
  // 스트릭 계산 헬퍼 (FE calculateStreak 포팅)
  // ──────────────────────────────────────────

  /** 개별 습관 현재 연속 달성 일수 */
  private calculateCurrentStreak(habit: Habit, checks: HabitCheck[]): number {
    if (habit.frequency === 'once') return 0;

    const checkedDates = new Set(
      checks.filter((c) => c.isChecked).map((c) => this.toDateKey(c.checkDate)),
    );

    if (checkedDates.size === 0) return 0;

    const today = this.todayKST();
    const todayKey = this.toDateKey(today);

    // 오늘이 체크 가능한 날인데 체크 안 되어 있으면 streak 0
    if (this.isHabitApplicableOnDate(habit, today) && !checkedDates.has(todayKey)) {
      return 0;
    }

    let streak = 0;
    const currentDate = new Date(today);

    if (this.isHabitApplicableOnDate(habit, today) && checkedDates.has(todayKey)) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (!this.isHabitApplicableOnDate(habit, today)) {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      return 0;
    }

    const habitStart = new Date(habit.startDate);
    habitStart.setHours(0, 0, 0, 0);
    let daysScanned = 0;

    while (daysScanned < 1000 && currentDate >= habitStart) {
      if (this.isHabitApplicableOnDate(habit, currentDate)) {
        const dateKey = this.toDateKey(currentDate);
        if (checkedDates.has(dateKey)) {
          streak++;
        } else {
          break;
        }
      }
      currentDate.setDate(currentDate.getDate() - 1);
      daysScanned++;
    }

    return streak;
  }

  /** 개별 습관 최고 연속 달성 일수 (순방향 순회) */
  private calculateBestStreak(habit: Habit, checks: HabitCheck[]): number {
    if (habit.frequency === 'once') return 0;

    const checkedDates = new Set(
      checks.filter((c) => c.isChecked).map((c) => this.toDateKey(c.checkDate)),
    );

    if (checkedDates.size === 0) return 0;

    const habitStart = new Date(habit.startDate);
    habitStart.setHours(0, 0, 0, 0);
    const today = this.todayKST();

    let best = 0;
    let temp = 0;
    const cur = new Date(habitStart);

    while (cur <= today) {
      if (this.isHabitApplicableOnDate(habit, cur)) {
        if (checkedDates.has(this.toDateKey(cur))) {
          temp++;
        } else {
          best = Math.max(best, temp);
          temp = 0;
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    return Math.max(best, temp);
  }

  /** 전체 종합 현재 스트릭: 모든 활성 습관이 100% 완료된 연속일 */
  private calculateOverallCurrentStreak(habits: Habit[], checks: HabitCheck[]): number {
    if (habits.length === 0) return 0;

    const today = this.todayKST();
    let streak = 0;
    const cur = new Date(today);
    let started = false;

    for (let i = 0; i < 1000; i++) {
      const applicableHabits = habits.filter((h) => this.isHabitApplicableOnDate(h, cur));

      if (applicableHabits.length === 0) {
        // 적용 가능한 습관이 없는 날은 건너뜀
        cur.setDate(cur.getDate() - 1);
        continue;
      }

      const dateStr = this.toDateKey(cur);
      const dayChecks = checks.filter(
        (c) => this.toDateKey(c.checkDate) === dateStr && c.isChecked,
      );

      const allCompleted = applicableHabits.every((h) => this.isHabitCompletedOnDate(h, dayChecks));

      if (allCompleted) {
        streak++;
        started = true;
      } else if (started || i === 0) {
        // 이미 연속이 시작된 후 끊기면 종료
        // 오늘이 미완료이면 streak 0
        break;
      } else {
        break;
      }

      cur.setDate(cur.getDate() - 1);
    }

    return streak;
  }

  /** 전체 종합 최고 스트릭 */
  private calculateOverallBestStreak(habits: Habit[], checks: HabitCheck[]): number {
    if (habits.length === 0) return 0;

    // 가장 이른 startDate 찾기
    const earliestStart = habits.reduce((min, h) => {
      const s = new Date(h.startDate);
      s.setHours(0, 0, 0, 0);
      return s < min ? s : min;
    }, new Date());

    const today = this.todayKST();
    let best = 0;
    let temp = 0;
    const cur = new Date(earliestStart);

    while (cur <= today) {
      const applicableHabits = habits.filter((h) => this.isHabitApplicableOnDate(h, cur));

      if (applicableHabits.length === 0) {
        cur.setDate(cur.getDate() + 1);
        continue;
      }

      const dateStr = this.toDateKey(cur);
      const dayChecks = checks.filter(
        (c) => this.toDateKey(c.checkDate) === dateStr && c.isChecked,
      );

      const allCompleted = applicableHabits.every((h) => this.isHabitCompletedOnDate(h, dayChecks));

      if (allCompleted) {
        temp++;
      } else {
        best = Math.max(best, temp);
        temp = 0;
      }

      cur.setDate(cur.getDate() + 1);
    }

    return Math.max(best, temp);
  }

  // ──────────────────────────────────────────
  // 유틸리티
  // ──────────────────────────────────────────

  /** 비율(0~1) → 기여도 레벨(0~4) */
  private ratioToLevel(ratio: number): ContributionLevel {
    if (ratio <= 0) return 0;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  }

  /** 달성률 계산 (0~100, 소수점 1자리) */
  private calcRate(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 1000) / 10;
  }

  /** KST 기준 오늘 00:00:00 Date 객체 */
  private todayKST(): Date {
    const now = new Date();
    // KST = UTC+9
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstTime = now.getTime() + kstOffset;
    const kstDate = new Date(kstTime);
    const y = kstDate.getUTCFullYear();
    const m = kstDate.getUTCMonth();
    const d = kstDate.getUTCDate();
    return new Date(y, m, d);
  }

  /** YYYY-MM-DD 문자열을 Date로 파싱 */
  private parseKSTDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  /** Date → YYYY-MM-DD 문자열 */
  private toDateKey(d: Date): string {
    const date = d instanceof Date ? d : new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
