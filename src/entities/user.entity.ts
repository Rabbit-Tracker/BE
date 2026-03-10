import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 닉네임 (표시 이름)
  @Column({ type: 'varchar', length: 30 })
  nickname: string;

  // 이메일 (선택)
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  // 아바타 이미지 URL (선택)
  @Column({ type: 'text', nullable: true })
  avatarUrl: string | null;

  // 아바타 이모지 (선택)
  @Column({ type: 'varchar', length: 10, nullable: true })
  avatarEmoji: string | null;

  // 비공개 계정 여부
  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  // 계정 상태: active | suspended | deleted
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  // 유저별 타임존
  @Column({ type: 'varchar', length: 50, default: 'Asia/Seoul' })
  timezone: string;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 마지막 수정 시각
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // 소프트 삭제 시각
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
