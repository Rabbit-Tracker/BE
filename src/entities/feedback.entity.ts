import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'feedbacks' })
export class Feedback {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 피드백 작성 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (FK)
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // 피드백 내용
  @Column({ type: 'text' })
  content: string;

  // 평점 (선택)
  @Column({ type: 'int', nullable: true })
  rating: number | null;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
