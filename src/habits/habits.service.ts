import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Habit } from '../entities/habit.entity.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepo: Repository<Habit>,
  ) {}

  async findAllByUser(userId: string): Promise<Habit[]> {
    return this.habitRepo.find({
      where: { userId, status: 'active' },
      order: { createdAt: 'ASC' },
    });
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
