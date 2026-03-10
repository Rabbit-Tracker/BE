import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notification_templates' })
export class NotificationTemplate {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 템플릿 코드 (유니크)
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  // 제목 템플릿
  @Column({ type: 'varchar', length: 100 })
  titleTemplate: string;

  // 본문 템플릿
  @Column({ type: 'text' })
  bodyTemplate: string;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
