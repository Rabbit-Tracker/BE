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

import { User } from './user.entity';

@Entity({ name: 'habit_categories' })
export class HabitCategory {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 카테고리 소유 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (FK)
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // 카테고리 이름
  @Column({ type: 'varchar', length: 50 })
  name: string;

  // 카테고리 아이콘 (이모지, 선택)
  @Column({ type: 'varchar', length: 10, nullable: true })
  icon: string | null;

  // 카테고리 색상 (HEX 코드, 선택)
  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string | null;

  // 공개 범위: private | friends | public
  @Column({ type: 'varchar', length: 10, default: 'private' })
  visibility: string;

  // 정렬 우선순위
  @Column({ type: 'int', default: 0 })
  sortOrder: number;

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
