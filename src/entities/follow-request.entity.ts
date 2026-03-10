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

@Entity({ name: 'follow_requests' })
@Unique(['requesterId', 'targetId'])
export class FollowRequest {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 요청 보내는 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  // 요청 보내는 유저 ID
  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId: string;

  // 요청 받는 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'target_id' })
  target: User;

  // 요청 받는 유저 ID
  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  // 상태: pending | accepted | rejected
  @Column({ type: 'varchar', length: 10, default: 'pending' })
  status: string;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 응답 시각 (선택)
  @Column({ type: 'timestamptz', nullable: true })
  respondedAt: Date | null;
}
