import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'user_sessions' })
export class UserSession {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 연결된 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (FK)
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // 리프레시 토큰 해시값
  @Column({ type: 'varchar', length: 255 })
  refreshTokenHash: string;

  // User-Agent 정보 (선택)
  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  // 세션 만료 시각
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  // 마지막 사용 시각
  @Column({ type: 'timestamptz' })
  lastUsedAt: Date;

  // 레코드 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
