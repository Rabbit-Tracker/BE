import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'notifications' })
export class Notification {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 알림 대상 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (FK)
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // 알림 타입: scheduled | reminder | celebration | system
  @Column({ type: 'varchar', length: 20 })
  type: string;

  // 알림 제목
  @Column({ type: 'varchar', length: 200 })
  title: string;

  // 알림 본문 (선택)
  @Column({ type: 'text', nullable: true })
  body: string | null;

  // 관련 습관 ID (선택)
  @Column({ type: 'uuid', nullable: true })
  habitId: string | null;

  // 관련 공지 ID (system 타입일 때, 선택)
  @Column({ type: 'uuid', nullable: true })
  noticeId: string | null;

  // 읽은 시각 (NULL = 미읽음)
  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null;

  // 발송 시각
  @Column({ type: 'timestamptz' })
  sentAt: Date;

  // 레코드 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
