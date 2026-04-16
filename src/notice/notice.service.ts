import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from '../entities/notice.entity';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
  ) {}

  /** 앱에 노출할 공지만: 게시됨 + 최신순(고정 우선) */
  async findPublishedList(): Promise<Notice[]> {
    return this.noticeRepository.find({
      where: { isPublished: true },
      order: { isPinned: 'DESC', createdAt: 'DESC' },
    });
  }

  /** 단건: 게시된 공지만 */
  async findPublishedById(id: string): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: { id, isPublished: true },
    });
    if (!notice) {
      throw new NotFoundException('공지를 찾을 수 없어.');
    }
    return notice;
  }
}
