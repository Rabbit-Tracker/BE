import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../entities/faq.entity';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  /** 앱 FAQ 목록: 노출 순서 → 생성일 오름차순 */
  async findListOrdered(): Promise<Faq[]> {
    return this.faqRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<Faq> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException('FAQ를 찾을 수 없어.');
    }
    return faq;
  }
}
