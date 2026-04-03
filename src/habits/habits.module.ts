import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HabitCategory } from '../entities/habit-category.entity.js';
import { Habit } from '../entities/habit.entity.js';
import { HabitsController } from './habits.controller.js';
import { HabitsService } from './habits.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Habit, HabitCategory])],
  controllers: [HabitsController],
  providers: [HabitsService],
})
export class HabitsModule {}
