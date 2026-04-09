import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Habit } from '../entities/habit.entity';
import { HabitCategory } from '../entities/habit-category.entity';
import { HabitCheck } from '../entities/habit-check.entity';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Habit, HabitCheck, HabitCategory])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
