import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Follow } from '../entities/follow.entity.js';
import { HabitCheck } from '../entities/habit-check.entity.js';
import { Habit } from '../entities/habit.entity.js';
import { User } from '../entities/user.entity.js';
import { FriendsController } from './friends.controller.js';
import { FriendsService } from './friends.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, Habit, HabitCheck])],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
