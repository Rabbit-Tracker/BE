import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoryProgressResponseDto } from './dto/category-progress-response.dto';
import { ContributionResponseDto } from './dto/contribution-response.dto';
import { DateRangeProgressResponseDto } from './dto/date-range-progress-response.dto';
import {
  CategoryQueryDto,
  ContributionQueryDto,
  DateRangeQueryDto,
  StatisticsQueryDto,
} from './dto/statistics-query.dto';
import { StreakResponseDto } from './dto/streak-response.dto';
import { TodayProgressResponseDto } from './dto/today-progress-response.dto';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('today-progress')
  @ApiOperation({ summary: '오늘 달성률 조회' })
  getTodayProgress(@Query() query: StatisticsQueryDto): Promise<TodayProgressResponseDto> {
    return this.statisticsService.getTodayProgress(query.userId);
  }

  @Get('weekly-progress')
  @ApiOperation({ summary: '주간 달성률 조회' })
  getWeeklyProgress(@Query() query: DateRangeQueryDto): Promise<DateRangeProgressResponseDto> {
    return this.statisticsService.getWeeklyProgress(query.userId, query.date);
  }

  @Get('monthly-progress')
  @ApiOperation({ summary: '월간 달성률 조회' })
  getMonthlyProgress(@Query() query: DateRangeQueryDto): Promise<DateRangeProgressResponseDto> {
    return this.statisticsService.getMonthlyProgress(query.userId, query.date);
  }

  @Get('category-progress')
  @ApiOperation({ summary: '카테고리별 달성률 조회' })
  getCategoryProgress(@Query() query: CategoryQueryDto): Promise<CategoryProgressResponseDto> {
    return this.statisticsService.getCategoryProgress(query.userId, query.period, query.categoryId);
  }

  @Get('streaks')
  @ApiOperation({ summary: '연속 달성일(스트릭) 조회' })
  getStreaks(@Query() query: StatisticsQueryDto): Promise<StreakResponseDto> {
    return this.statisticsService.getStreaks(query.userId);
  }

  @Get('contributions')
  @ApiOperation({ summary: '기여도(잔디) 조회' })
  getContributions(@Query() query: ContributionQueryDto): Promise<ContributionResponseDto> {
    return this.statisticsService.getContributions(query.userId, query.days);
  }
}
