import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Follow } from '../entities/follow.entity.js';
import { Habit } from '../entities/habit.entity.js';
import { HabitCheck } from '../entities/habit-check.entity.js';
import { User } from '../entities/user.entity.js';
import { DevController } from './dev.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, Habit, HabitCheck])],
  controllers: [DevController],
})
export class DevModule {}
