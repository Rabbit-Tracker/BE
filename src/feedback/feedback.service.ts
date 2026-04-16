import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  /** 로그인 유저 기준으로 피드백 1건 저장 */
  async create(userId: string, dto: CreateFeedbackDto): Promise<Feedback> {
    const trimmedContent = dto.content.trim();
    const entity = this.feedbackRepository.create({
      userId,
      content: trimmedContent,
      rating: dto.rating ?? null,
    });
    return this.feedbackRepository.save(entity);
  }
}
