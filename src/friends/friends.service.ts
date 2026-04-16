import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { createHash } from 'crypto';

import { Follow } from '../entities/follow.entity.js';
import { User } from '../entities/user.entity.js';

export type FriendCardDto = {
  userId: string;
  nickname: string;
  email: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
  isFollowing: boolean;
  isFollower: boolean;
};

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
  ) {}

  getMyFriendCode(userId: string): string {
    // DB 컬럼 없이도 재현 가능한 코드 (6자리) — userId 기반 해시
    const hash = createHash('sha1').update(userId).digest('hex').toUpperCase();
    // 혼동 적은 문자셋으로 매핑
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i += 1) {
      const byte = parseInt(hash.slice(i * 2, i * 2 + 2), 16);
      code += chars[byte % chars.length];
    }
    return code;
  }

  private async getRelationSets(currentUserId: string): Promise<{
    followingIds: Set<string>;
    followerIds: Set<string>;
  }> {
    const follows = await this.followRepo.find({
      where: [{ followerId: currentUserId }, { followingId: currentUserId }],
    });

    const followingIds = new Set<string>();
    const followerIds = new Set<string>();

    for (const f of follows) {
      if (f.followerId === currentUserId) followingIds.add(f.followingId);
      if (f.followingId === currentUserId) followerIds.add(f.followerId);
    }

    return { followingIds, followerIds };
  }

  private toCardDto(
    user: User,
    relation: { followingIds: Set<string>; followerIds: Set<string> },
  ): FriendCardDto {
    return {
      userId: user.id,
      nickname: user.nickname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      isFollowing: relation.followingIds.has(user.id),
      isFollower: relation.followerIds.has(user.id),
    };
  }

  async getRecommendations(currentUserId: string): Promise<FriendCardDto[]> {
    const relation = await this.getRelationSets(currentUserId);
    const users = await this.userRepo.find({
      where: { id: Not(currentUserId), status: 'active', deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: 200,
    });
    // 이미 팔로우 중인 유저는 추천에서 제외 (추천 탭에서 안 보이게)
    return users
      .filter((u) => !relation.followingIds.has(u.id))
      .map((u) => this.toCardDto(u, relation));
  }

  async getFollowing(currentUserId: string): Promise<FriendCardDto[]> {
    const relation = await this.getRelationSets(currentUserId);
    const followRows = await this.followRepo.find({ where: { followerId: currentUserId } });
    const ids = followRows.map((f) => f.followingId);
    if (ids.length === 0) return [];
    const users = await this.userRepo.find({
      where: { id: In(ids), status: 'active', deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => this.toCardDto(u, relation));
  }

  async getFollowers(currentUserId: string): Promise<FriendCardDto[]> {
    const relation = await this.getRelationSets(currentUserId);
    const followRows = await this.followRepo.find({ where: { followingId: currentUserId } });
    const ids = followRows.map((f) => f.followerId);
    if (ids.length === 0) return [];
    const users = await this.userRepo.find({
      where: { id: In(ids), status: 'active', deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => this.toCardDto(u, relation));
  }

  async search(currentUserId: string, query: string): Promise<FriendCardDto[]> {
    const q = query.trim();
    if (!q) return [];
    const relation = await this.getRelationSets(currentUserId);

    // 단순 LIKE 검색 (nickname/email). 규모 작다고 가정.
    const users = await this.userRepo
      .createQueryBuilder('u')
      .where('u.deletedAt IS NULL')
      .andWhere('u.status = :status', { status: 'active' })
      .andWhere('u.id != :me', { me: currentUserId })
      .andWhere('(u.nickname ILIKE :q OR u.email ILIKE :q)', { q: `%${q}%` })
      .orderBy('u.createdAt', 'DESC')
      .limit(50)
      .getMany();

    return users.map((u) => this.toCardDto(u, relation));
  }

  async getFriendById(currentUserId: string, friendUserId: string): Promise<FriendCardDto | null> {
    if (!friendUserId) return null;
    const relation = await this.getRelationSets(currentUserId);
    const user = await this.userRepo.findOne({
      where: { id: friendUserId, status: 'active', deletedAt: IsNull() },
    });
    if (!user) return null;
    return this.toCardDto(user, relation);
  }

  async follow(currentUserId: string, targetUserId: string): Promise<void> {
    if (!targetUserId || targetUserId === currentUserId) return;
    const existing = await this.followRepo.findOne({
      where: { followerId: currentUserId, followingId: targetUserId },
    });
    if (existing) return;
    await this.followRepo.save(
      this.followRepo.create({ followerId: currentUserId, followingId: targetUserId }),
    );
  }

  async unfollow(currentUserId: string, targetUserId: string): Promise<void> {
    if (!targetUserId || targetUserId === currentUserId) return;
    await this.followRepo.delete({ followerId: currentUserId, followingId: targetUserId });
  }
}
