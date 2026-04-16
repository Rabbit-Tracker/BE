import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitCategory } from '../entities/habit-category.entity';
import { User } from '../entities/user.entity';
import { HabitCategoryService } from './habit-category.service';
import { HabitCategoryController } from './habit-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HabitCategory, User])],
  controllers: [HabitCategoryController],
  providers: [HabitCategoryService],
})
export class HabitCategoryModule {}
