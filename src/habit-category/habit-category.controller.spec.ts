import { Test, TestingModule } from '@nestjs/testing';
import { HabitCategoryController } from './habit-category.controller';
import { HabitCategoryService } from './habit-category.service';

describe('HabitCategoryController', () => {
  let controller: HabitCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitCategoryController],
      providers: [HabitCategoryService],
    }).compile();

    controller = module.get<HabitCategoryController>(HabitCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
