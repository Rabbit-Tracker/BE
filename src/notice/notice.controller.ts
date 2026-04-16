import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NoticeService } from './notice.service';

@ApiTags('notices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notices')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  @ApiOperation({ summary: '게시된 공지 목록 (로그인 불필요)' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  findPublishedList() {
    return this.noticeService.findPublishedList();
  }

  @Get(':id')
  @ApiOperation({ summary: '게시된 공지 단건 (로그인 불필요)' })
  @ApiParam({
    name: 'id',
    required: true,
    description: '공지 UUID',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '없거나 비공개 공지' })
  findPublishedById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.noticeService.findPublishedById(id);
  }
}
