import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'faqs' })
export class Faq {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 질문
  @Column({ type: 'varchar', length: 150 })
  question: string;

  // 답변
  @Column({ type: 'text' })
  answer: string;

  // 노출 순서
  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 수정 시각
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
