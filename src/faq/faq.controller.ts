import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FaqService } from './faq.service';

@ApiTags('faqs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @ApiOperation({ summary: 'FAQ 목록' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  findList() {
    return this.faqService.findListOrdered();
  }

  @Get(':id')
  @ApiOperation({ summary: 'FAQ 단건' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'FAQ UUID',
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '없는 FAQ' })
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.faqService.findById(id);
  }
}
