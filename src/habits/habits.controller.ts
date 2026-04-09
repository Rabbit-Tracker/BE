import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';
import { UpsertCheckDto } from './dto/upsert-check.dto.js';
import { HabitsService, type DeleteScope } from './habits.service.js';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  private readonly logger = new Logger(HabitsController.name);

  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.habitsService.findAllByUser(user.id);
  }

  @Get('checks')
  findChecks(@CurrentUser() user: CurrentUserPayload) {
    return this.habitsService.findChecksByUser(user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ) {
    return this.habitsService.update(user.id, id, dto);
  }

  @Patch(':id/archive')
  archive(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.habitsService.archive(user.id, id);
  }

  @Patch(':id/unarchive')
  unarchive(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.habitsService.unarchive(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Query('scope') scope?: DeleteScope,
    @Query('fromDate') fromDate?: string,
  ) {
    return this.habitsService.delete(user.id, id, scope ?? 'ALL', fromDate);
  }

  @Post(':habitId/checks')
  @HttpCode(HttpStatus.OK)
  upsertCheck(
    @CurrentUser() user: CurrentUserPayload,
    @Param('habitId') habitId: string,
    @Body() dto: UpsertCheckDto,
  ) {
    return this.habitsService.upsertCheck(user.id, habitId, dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateHabitDto) {
    this.logger.log(`[POST /habits] userId=${user.id}, body=${JSON.stringify(dto)}`);
    try {
      const result = await this.habitsService.create(user.id, dto);
      this.logger.log(`[POST /habits] 저장 성공 id=${result.id}`);
      return result;
    } catch (e) {
      this.logger.error('[POST /habits] 저장 실패', e instanceof Error ? e.stack : String(e));
      throw e;
    }
  }
}
