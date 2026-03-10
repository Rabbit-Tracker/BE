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

@Entity({ name: 'onboarding_profiles' })
export class OnboardingProfile {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 연결된 유저 (1:1)
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 유저 ID (UNI)
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  // 생활 패턴: morning | evening | flexible
  @Column({ type: 'varchar', length: 20 })
  lifestyle: string;

  // 연령대: '10대' | '20대 초반' 등
  @Column({ type: 'varchar', length: 20 })
  ageRange: string;

  // 직군 카테고리: '학생' | '개발자' 등
  @Column({ type: 'varchar', length: 30 })
  jobCategory: string;

  // 직군 상세 텍스트 (선택)
  @Column({ type: 'varchar', length: 50, nullable: true })
  jobText: string | null;

  // 관심사 배열
  @Column({ type: 'text', array: true })
  interests: string[];

  // 사용 목적 텍스트
  @Column({ type: 'varchar', length: 200 })
  purposeText: string;

  // 난이도: easy | medium | hard
  @Column({ type: 'varchar', length: 10 })
  difficulty: string;

  // 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 수정 시각
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
