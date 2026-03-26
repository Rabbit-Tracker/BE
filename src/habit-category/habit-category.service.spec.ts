import { Test, TestingModule } from '@nestjs/testing';
import { HabitCategoryService } from './habit-category.service';

describe('HabitCategoryService', () => {
  let service: HabitCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabitCategoryService],
    }).compile();

    service = module.get<HabitCategoryService>(HabitCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
