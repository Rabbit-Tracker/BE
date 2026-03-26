import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HabitCategory } from '../entities/habit-category.entity';
import { CreateHabitCategoryDto } from './dto/create-habit-category.dto';
import { UpdateHabitCategoryDto } from './dto/update-habit-category.dto';

@Injectable()
export class HabitCategoryService {
  constructor(
    @InjectRepository(HabitCategory)
    private readonly habitCategoryRepository: Repository<HabitCategory>,
  ) {}

  async create(createHabitCategoryDto: CreateHabitCategoryDto) {
    const { userId, name, icon, visibility, sortOrder } = createHabitCategoryDto;

    // 같은 유저 내에서 동일 이름 카테고리 중복 방지 (소프트삭제 제외)
    const existingCategory = await this.habitCategoryRepository.findOne({
      where: { userId, name },
      withDeleted: false,
    });
    if (existingCategory) {
      throw new ConflictException('이미 존재하는 카테고리 이름이야.');
    }

    const habitCategory = this.habitCategoryRepository.create({
      userId,
      name,
      icon: icon ?? null,
      visibility: visibility ?? 'private',
      sortOrder: sortOrder ?? 0,
    });

    return await this.habitCategoryRepository.save(habitCategory);
  }

  async findAllByUserId(userId: string) {
    if (!userId) {
      throw new BadRequestException('userId는 필수야.');
    }

    return await this.habitCategoryRepository.find({
      where: { userId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOneById(id: string) {
    const habitCategory = await this.habitCategoryRepository.findOne({
      where: { id },
    });
    if (!habitCategory) {
      throw new NotFoundException('카테고리를 찾을 수 없어.');
    }
    return habitCategory;
  }

  async updateById(id: string, updateHabitCategoryDto: UpdateHabitCategoryDto) {
    const habitCategory = await this.findOneById(id);

    // 이름 변경 시 중복 체크 (같은 유저 범위)
    if (
      typeof updateHabitCategoryDto.name === 'string' &&
      updateHabitCategoryDto.name.length > 0 &&
      updateHabitCategoryDto.name !== habitCategory.name
    ) {
      const duplicatedCategory = await this.habitCategoryRepository.findOne({
        where: { userId: habitCategory.userId, name: updateHabitCategoryDto.name },
      });
      if (duplicatedCategory) {
        throw new ConflictException('이미 존재하는 카테고리 이름이야.');
      }
    }

    const updatedHabitCategory = this.habitCategoryRepository.merge(habitCategory, {
      ...updateHabitCategoryDto,
      // icon은 null 허용이니까 undefined면 유지, null이면 명시적으로 삭제로 처리
      icon:
        updateHabitCategoryDto.icon === undefined
          ? habitCategory.icon
          : updateHabitCategoryDto.icon,
    });

    return await this.habitCategoryRepository.save(updatedHabitCategory);
  }

  async removeById(id: string) {
    // 존재 여부를 먼저 확인해서 404를 정확히 반환
    await this.findOneById(id);

    await this.habitCategoryRepository.softDelete({ id });
    return { ok: true };
  }
}
