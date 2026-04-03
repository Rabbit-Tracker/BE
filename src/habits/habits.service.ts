import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { HabitCheck } from '../entities/habit-check.entity.js';
import { Habit } from '../entities/habit.entity.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpsertCheckDto } from './dto/upsert-check.dto.js';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepo: Repository<Habit>,
    @InjectRepository(HabitCheck)
    private readonly checkRepo: Repository<HabitCheck>,
  ) {}

  async findAllByUser(userId: string): Promise<Habit[]> {
    return this.habitRepo.find({
      where: { userId, status: 'active' },
      order: { createdAt: 'ASC' },
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
      icon: dto.icon ?? null,
      categoryId: dto.categoryId ?? null,
      status: 'active',
    });

    return this.habitRepo.save(habit);
  }
}
