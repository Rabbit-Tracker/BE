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

@Entity({ name: 'follows' })
@Unique(['followerId', 'followingId'])
export class Follow {
  // PK: UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 팔로우 하는 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  // 팔로우 하는 유저 ID
  @Column({ name: 'follower_id', type: 'uuid' })
  followerId: string;

  // 팔로우 당하는 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: 'following_id' })
  following: User;

  // 팔로우 당하는 유저 ID
  @Column({ name: 'following_id', type: 'uuid' })
  followingId: string;

  // 팔로우 생성 시각
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
