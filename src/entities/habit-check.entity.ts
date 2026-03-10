import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Habit } from './habit.entity';
import { User } from './user.entity';

@Entity({ name: 'habit_checks' })
export class HabitCheck {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 대상 습관
  @ManyToOne(() => Habit)
  @JoinColumn({ name: 'habit_id' })
  habit: Habit;

  // 습관 ID (FK)
  @Column({ name: 'habit_id', type: 'uuid' })
  habitId: string;

  // 체크한 유저 (비정규화)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (FK, 진행률 집계용)
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // 체크 대상 날짜 (해당 일자 00:00:00+09)
  @Column({ type: 'timestamptz' })
  checkDate: Date;

  // 체크 여부 (false로 토글할 수도 있음)
  @Column({ type: 'boolean', default: true })
  isChecked: boolean;

  // 실제 체크한 시각
  @Column({ type: 'timestamptz' })
  checkedAt: Date;

  // 알림 기준 시간 (예: '09:00', 선택)
  @Column({ type: 'varchar', length: 5, nullable: true })
  notificationTime: string | null;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 수정 시각
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
