import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'user_notification_settings' })
export class UserNotificationSetting {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 유저 (1:1)
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (UNI)
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  // 푸시 전체 활성 여부
  @Column({ type: 'boolean', default: true })
  isPushEnabled: boolean;

  // 방해 금지 시작 시간 (예: '23:00')
  @Column({ type: 'varchar', length: 5, nullable: true })
  doNotDisturbStart: string | null;

  // 방해 금지 종료 시간 (예: '07:00')
  @Column({ type: 'varchar', length: 5, nullable: true })
  doNotDisturbEnd: string | null;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 수정 시각
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
