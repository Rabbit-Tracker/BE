import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Notice } from './notice.entity';
import { User } from './user.entity';

@Entity({ name: 'notice_reads' })
@Unique(['noticeId', 'userId'])
export class NoticeRead {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 공지
  @ManyToOne(() => Notice)
  @JoinColumn({ name: 'notice_id' })
  notice: Notice;

  // 공지 ID
  @Column({ name: 'notice_id', type: 'uuid' })
  noticeId: string;

  // 읽은 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // 읽은 시각
  @Column({ type: 'timestamptz' })
  readAt: Date;

  // 레코드 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
