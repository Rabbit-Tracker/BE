import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'notices' })
export class Notice {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 공지 제목
  @Column({ type: 'varchar', length: 200 })
  title: string;

  // 공지 본문
  @Column({ type: 'text' })
  content: string;

  // 공개 여부
  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  // 상단 고정 여부
  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  // 실제 게시 시각 (선택)
  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 수정 시각
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
