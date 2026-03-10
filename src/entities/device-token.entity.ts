import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'device_tokens' })
export class DeviceToken {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 토큰 소유 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (FK)
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // FCM 토큰 (유니크)
  @Column({ type: 'text', unique: true })
  token: string;

  // 플랫폼: ios | android
  @Column({ type: 'varchar', length: 10 })
  platform: string;

  // 활성 여부
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 수정 시각
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
