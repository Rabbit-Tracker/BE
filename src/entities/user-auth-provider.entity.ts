import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'user_auth_providers' })
@Unique(['provider', 'providerUserId'])
export class UserAuthProvider {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 연결된 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (FK, 조회/조인 최적화용)
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // 인증 제공자: kakao | google | apple
  @Column({ type: 'varchar', length: 10 })
  provider: string;

  // 제공자 측 사용자 ID
  @Column({ type: 'varchar', length: 255 })
  providerUserId: string;

  // 제공자에서 내려준 이메일 (선택)
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
