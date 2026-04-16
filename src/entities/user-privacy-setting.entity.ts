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

/** 잔디 등 기여(연속) 노출 범위 — FE `settings` 공개 범위와 동일 */
export type ContributionVisibility = 'all' | 'friends' | 'none';

@Entity({ name: 'user_privacy_settings' })
export class UserPrivacySetting {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 유저 (1:1)
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (UNIQUE)
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  // true면 오늘 진행률을 친구에게만 공개 (FE `todayProgressFriendsOnly` 와 동일 의미)
  @Column({ type: 'boolean', default: false })
  todayProgressFriendsOnly: boolean;

  // 잔디(기여) 공개 범위: 전체 / 친구만 / 비공개
  @Column({ type: 'varchar', length: 20, default: 'friends' })
  contributionVisibility: ContributionVisibility;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 수정 시각
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
