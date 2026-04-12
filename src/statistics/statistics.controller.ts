import { Controller, Get, Query } from '@nestjs/common';

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

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /** 오늘 달성률 조회 */
  @Get('today-progress')
  getTodayProgress(@Query() query: StatisticsQueryDto): Promise<TodayProgressResponseDto> {
    return this.statisticsService.getTodayProgress(query.userId);
  }

  /** 주간 달성률 조회 */
  @Get('weekly-progress')
  getWeeklyProgress(@Query() query: DateRangeQueryDto): Promise<DateRangeProgressResponseDto> {
    return this.statisticsService.getWeeklyProgress(query.userId, query.date);
  }

  /** 월간 달성률 조회 */
  @Get('monthly-progress')
  getMonthlyProgress(@Query() query: DateRangeQueryDto): Promise<DateRangeProgressResponseDto> {
    return this.statisticsService.getMonthlyProgress(query.userId, query.date);
  }

  /** 카테고리별 달성률 조회 */
  @Get('category-progress')
  getCategoryProgress(@Query() query: CategoryQueryDto): Promise<CategoryProgressResponseDto> {
    return this.statisticsService.getCategoryProgress(query.userId, query.period, query.categoryId);
  }

  /** 연속 달성일(스트릭) 조회 */
  @Get('streaks')
  getStreaks(@Query() query: StatisticsQueryDto): Promise<StreakResponseDto> {
    return this.statisticsService.getStreaks(query.userId);
  }

  /** 기여도(잔디) 조회 */
  @Get('contributions')
  getContributions(@Query() query: ContributionQueryDto): Promise<ContributionResponseDto> {
    return this.statisticsService.getContributions(query.userId, query.days);
  }
}
