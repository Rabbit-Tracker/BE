import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { HabitCheck } from '../entities/habit-check.entity.js';
import { Habit } from '../entities/habit.entity.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';
import { UpsertCheckDto } from './dto/upsert-check.dto.js';

export type DeleteScope = 'ALL' | 'FUTURE_INCOMPLETE' | 'THIS_ONLY';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepo: Repository<Habit>,
    @InjectRepository(HabitCheck)
    private readonly checkRepo: Repository<HabitCheck>,
  ) {}

  async update(userId: string, habitId: string, dto: UpdateHabitDto): Promise<Habit> {
    const habit = await this.habitRepo.findOne({ where: { id: habitId, userId } });
    if (!habit) throw new Error('습관을 찾을 수 없습니다');

    const scope = dto.scope ?? 'ALL';

    if (scope === 'THIS_ONLY') {
      // 이 항목만: 원본에 해당 날짜를 excludedDates에 추가 + 새 1회성 습관 생성
      const fromDate = dto.fromDate ?? new Date().toISOString().split('T')[0];
      const excluded = habit.excludedDates ?? [];
      if (!excluded.includes(fromDate)) {
        habit.excludedDates = [...excluded, fromDate];
        await this.habitRepo.save(habit);
      }

      // 해당 날짜에 대한 1회성 새 습관 생성
      return this.habitRepo.save(
        this.habitRepo.create({
          userId,
          name: dto.name ?? habit.name,
          description:
            dto.description !== undefined ? (dto.description ?? null) : habit.description,
          frequency: 'once',
          frequencyDetail: 1,
          selectedDays: [new Date(fromDate).getDay()],
          notificationTimes: dto.notificationTimes ?? habit.notificationTimes,
          startDate: new Date(fromDate),
          endDate: new Date(fromDate),
          excludedDates: null,
          icon: dto.icon !== undefined ? (dto.icon ?? null) : habit.icon,
          categoryId: dto.categoryId !== undefined ? (dto.categoryId ?? null) : habit.categoryId,
          status: 'active',
        }),
      );
    }

    if (scope === 'FUTURE_INCOMPLETE') {
      // 미완료만: 원본 endDate를 fromDate-1일로 설정 + 새 습관 생성
      const fromDate = dto.fromDate ?? new Date().toISOString().split('T')[0];
      const cutoff = new Date(fromDate);
      cutoff.setDate(cutoff.getDate() - 1);
      cutoff.setHours(23, 59, 59, 999);
      habit.endDate = cutoff;
      await this.habitRepo.save(habit);

      // fromDate 이후 미완료(isChecked=false) 체크 삭제
      const fromDateObj = new Date(fromDate);
      fromDateObj.setHours(0, 0, 0, 0);
      await this.checkRepo
        .createQueryBuilder()
        .delete()
        .where('"habit_id" = :habitId', { habitId })
        .andWhere('"checkDate" >= :fromDate', { fromDate: fromDateObj })
        .andWhere('"isChecked" = false')
        .execute();

      // fromDate 이후 "완료된 날짜"는 새 습관에서 제외해야 함.
      // (완료된 날에 수정된 할 일이 새로 생기는 현상 방지)
      const completedChecks = await this.checkRepo
        .createQueryBuilder('check')
        .where('check.habitId = :habitId', { habitId })
        .andWhere('check.isChecked = true')
        .andWhere('check.checkDate >= :fromDate', { fromDate: fromDateObj })
        .getMany();

      const completedDateKeys = this.getCompletedDateKeys(habit, completedChecks);

      // 새 습관 생성 (fromDate부터 시작)
      const newHabit = await this.habitRepo.save(
        this.habitRepo.create({
          userId,
          name: dto.name ?? habit.name,
          description:
            dto.description !== undefined ? (dto.description ?? null) : habit.description,
          frequency: dto.frequency ?? habit.frequency,
          frequencyDetail:
            dto.frequencyDetail !== undefined
              ? (dto.frequencyDetail ?? null)
              : habit.frequencyDetail,
          selectedDays:
            dto.selectedDays !== undefined ? (dto.selectedDays ?? null) : habit.selectedDays,
          notificationTimes: dto.notificationTimes ?? habit.notificationTimes,
          startDate: new Date(fromDate),
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          excludedDates: completedDateKeys.length > 0 ? completedDateKeys : null,
          icon: dto.icon !== undefined ? (dto.icon ?? null) : habit.icon,
          categoryId: dto.categoryId !== undefined ? (dto.categoryId ?? null) : habit.categoryId,
          status: 'active',
        }),
      );

      return newHabit;
    }

    // ALL (기본): 기존 습관 전체 수정
    if (dto.name !== undefined) habit.name = dto.name;
    if (dto.description !== undefined) habit.description = dto.description ?? null;
    if (dto.frequency !== undefined) habit.frequency = dto.frequency;
    if (dto.frequencyDetail !== undefined) habit.frequencyDetail = dto.frequencyDetail ?? null;
    if (dto.selectedDays !== undefined) habit.selectedDays = dto.selectedDays ?? null;
    if (dto.notificationTimes !== undefined) habit.notificationTimes = dto.notificationTimes;
    if (dto.startDate !== undefined) habit.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) habit.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.icon !== undefined) habit.icon = dto.icon ?? null;
    if (dto.categoryId !== undefined) habit.categoryId = dto.categoryId ?? null;

    return this.habitRepo.save(habit);
  }

  async delete(
    userId: string,
    habitId: string,
    scope: DeleteScope = 'ALL',
    fromDate?: string,
  ): Promise<void> {
    const habit = await this.habitRepo.findOne({ where: { id: habitId, userId } });
    if (!habit) return;

    if (scope === 'THIS_ONLY') {
      // 이 항목만: excludedDates에 날짜 추가
      const date = fromDate ?? new Date().toISOString().split('T')[0];
      const excluded = habit.excludedDates ?? [];
      if (!excluded.includes(date)) {
        habit.excludedDates = [...excluded, date];
        await this.habitRepo.save(habit);
      }
      return;
    }

    if (scope === 'FUTURE_INCOMPLETE') {
      // 미완료만: endDate를 fromDate-1일로 설정
      const date = fromDate ?? new Date().toISOString().split('T')[0];
      const cutoff = new Date(date);
      cutoff.setDate(cutoff.getDate() - 1);
      cutoff.setHours(23, 59, 59, 999);
      habit.endDate = cutoff;
      await this.habitRepo.save(habit);

      // fromDate 이후 미완료(isChecked=false) 체크 삭제
      const fromDateObj = new Date(date);
      fromDateObj.setHours(0, 0, 0, 0);
      await this.checkRepo
        .createQueryBuilder()
        .delete()
        .where('"habit_id" = :habitId', { habitId })
        .andWhere('"checkDate" >= :fromDate', { fromDate: fromDateObj })
        .andWhere('"isChecked" = false')
        .execute();
      return;
    }

    // ALL: 소프트 삭제
    await this.habitRepo.softDelete({ id: habitId, userId });
  }

  async findAllByUser(userId: string): Promise<Habit[]> {
    return this.habitRepo.find({
      where: { userId, status: 'active' },
      order: { createdAt: 'ASC' },
    });
  }

  async findChecksByUser(userId: string): Promise<HabitCheck[]> {
    return this.checkRepo.find({
      where: { userId },
      order: { checkDate: 'DESC' },
    });
  }

  async upsertCheck(userId: string, habitId: string, dto: UpsertCheckDto): Promise<HabitCheck> {
    const checkDate = new Date(dto.checkDate);
    const notificationTime = dto.notificationTime ?? null;

    const existing = await this.checkRepo.findOne({
      where: {
        habitId,
        userId,
        checkDate,
        notificationTime: notificationTime ?? IsNull(),
      },
    });

    if (existing) {
      existing.isChecked = dto.isChecked;
      existing.checkedAt = new Date(dto.checkedAt);
      return this.checkRepo.save(existing);
    }

    const check = this.checkRepo.create({
      habitId,
      userId,
      checkDate,
      isChecked: dto.isChecked,
      checkedAt: new Date(dto.checkedAt),
      notificationTime,
    });
    return this.checkRepo.save(check);
  }

  async create(userId: string, dto: CreateHabitDto): Promise<Habit> {
    const habit = this.habitRepo.create({
      userId,
      name: dto.name,
      description: dto.description ?? null,
      frequency: dto.frequency,
      frequencyDetail: dto.frequencyDetail ?? null,
      selectedDays: dto.selectedDays ?? null,
      notificationTimes: dto.notificationTimes,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      excludedDates: null,
      icon: dto.icon ?? null,
      categoryId: dto.categoryId ?? null,
      status: 'active',
    });

    return this.habitRepo.save(habit);
  }

  private getCompletedDateKeys(habit: Habit, checks: HabitCheck[]): string[] {
    if (checks.length === 0) return [];

    const checksByDateKey = new Map<string, HabitCheck[]>();
    for (const check of checks) {
      const dateKey = this.toDateKeyLocal(check.checkDate);
      const current = checksByDateKey.get(dateKey) ?? [];
      current.push(check);
      checksByDateKey.set(dateKey, current);
    }

    const notificationTimes = habit.notificationTimes ?? [];
    const completedDateKeys: string[] = [];

    for (const [dateKey, dateChecks] of checksByDateKey.entries()) {
      if (notificationTimes.length > 0) {
        const allTimesChecked = notificationTimes.every((time) =>
          dateChecks.some((check) => check.notificationTime === time && check.isChecked),
        );
        if (allTimesChecked) {
          completedDateKeys.push(dateKey);
        }
        continue;
      }

      const hasChecked = dateChecks.some((check) => check.isChecked);
      if (hasChecked) {
        completedDateKeys.push(dateKey);
      }
    }

    return completedDateKeys.sort();
  }

  private toDateKeyLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
