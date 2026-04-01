import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HabitCategoryService } from './habit-category.service';
import { CreateHabitCategoryDto } from './dto/create-habit-category.dto';
import { UpdateHabitCategoryDto } from './dto/update-habit-category.dto';

const SWAGGER_EXAMPLE_USER_ID = '11111111-1111-1111-1111-111111111111';
const SWAGGER_EXAMPLE_CATEGORY_ID = '22222222-2222-2222-2222-222222222222';

@ApiTags('habit-categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('habit-categories')
export class HabitCategoryController {
  constructor(private readonly habitCategoryService: HabitCategoryService) {}

  @Post()
  @ApiOperation({ summary: '습관 카테고리 생성' })
  @ApiBody({
    type: CreateHabitCategoryDto,
    examples: {
      default: {
        summary: '생성 요청 예시',
        value: {
          userId: SWAGGER_EXAMPLE_USER_ID,
          name: '운동',
          icon: '💪',
          color: '#22C55E',
          visibility: 'private',
          sortOrder: 0,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 카테고리 이름' })
  create(@Body() createHabitCategoryDto: CreateHabitCategoryDto) {
    return this.habitCategoryService.create(createHabitCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: '유저의 습관 카테고리 목록 조회' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: '유저 UUID',
    schema: { type: 'string', format: 'uuid', example: SWAGGER_EXAMPLE_USER_ID },
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 400, description: 'userId 누락 또는 형식 오류' })
  findAllByUserId(@Query('userId', new ParseUUIDPipe()) userId: string) {
    return this.habitCategoryService.findAllByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '습관 카테고리 단건 조회' })
  @ApiParam({
    name: 'id',
    required: true,
    description: '카테고리 UUID',
    schema: { type: 'string', format: 'uuid', example: SWAGGER_EXAMPLE_CATEGORY_ID },
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  findOneById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.habitCategoryService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '습관 카테고리 수정' })
  @ApiParam({
    name: 'id',
    required: true,
    description: '카테고리 UUID',
    schema: { type: 'string', format: 'uuid', example: SWAGGER_EXAMPLE_CATEGORY_ID },
  })
  @ApiBody({
    type: UpdateHabitCategoryDto,
    examples: {
      rename: {
        summary: '이름/아이콘/색상 변경 예시',
        value: { name: '공부', icon: '📚', color: '#3B82F6' },
      },
      reorder: {
        summary: '정렬/공개범위 변경 예시',
        value: { sortOrder: 10, visibility: 'friends' },
      },
      removeIcon: {
        summary: '아이콘/색상 제거 예시',
        value: { icon: null, color: null },
      },
    },
  })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 존재하는 카테고리 이름' })
  updateById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateHabitCategoryDto: UpdateHabitCategoryDto,
  ) {
    return this.habitCategoryService.updateById(id, updateHabitCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '습관 카테고리 삭제(소프트 삭제)' })
  @ApiParam({
    name: 'id',
    required: true,
    description: '카테고리 UUID',
    schema: { type: 'string', format: 'uuid', example: SWAGGER_EXAMPLE_CATEGORY_ID },
  })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  removeById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.habitCategoryService.removeById(id);
  }
}
