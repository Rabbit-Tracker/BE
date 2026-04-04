import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { HabitCategory } from './habit-category.entity';
import { User } from './user.entity';

@Entity({ name: 'habits' })
export class Habit {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 습관 소유 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (FK)
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // 카테고리 (선택)
  @ManyToOne(() => HabitCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: HabitCategory | null;

  // 카테고리 ID (FK, nullable)
  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  // 습관 이름
  @Column({ type: 'varchar', length: 100 })
  name: string;

  // 설명 (선택)
  @Column({ type: 'text', nullable: true })
  description: string | null;

  // 빈도 타입: daily | weekly | once | custom
  @Column({ type: 'varchar', length: 10 })
  frequency: string;

  // 주간 횟수 등 상세 빈도 (선택)
  @Column({ type: 'int', nullable: true })
  frequencyDetail: number | null;

  // 선택 요일 (0~6, 일~토)
  @Column({ type: 'int', array: true, nullable: true })
  selectedDays: number[] | null;

  // 알림 시간 배열 (예: ['09:00', '21:00'])
  @Column({ type: 'text', array: true, default: '{}' })
  notificationTimes: string[];

  // 시작 날짜 (TIMESTAMPTZ)
  @Column({ type: 'timestamptz' })
  startDate: Date;

  // 종료 날짜 (TIMESTAMPTZ, 선택 - daily/weekly 필수)
  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;

  // 제외 날짜 목록 (ISO date string 배열, '이 항목만' 수정/삭제 시 사용)
  @Column({ type: 'text', array: true, nullable: true })
  excludedDates: string[] | null;

  // 습관 아이콘 (이모지, 선택)
  @Column({ type: 'varchar', length: 10, nullable: true })
  icon: string | null;

  // 상태: active | archived
  @Column({ type: 'varchar', length: 10, default: 'active' })
  status: string;

  // 보관 처리 시각 (선택)
  @Column({ type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 수정 시각
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // 소프트 삭제 시각
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
