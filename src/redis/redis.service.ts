import { Injectable } from '@nestjs/common';
import { RedisInitService } from './redis-init.service';
import { ConfigService } from '@nestjs/config';
import { RedisHashService } from './redis-hashes.service';
import { EnvType } from 'src/env/env.interface';
import {
  RedisAccessToken,
  RedisAllPermissions,
  RedisKeys,
} from './redis.interface';
import { ModuleRef } from '@nestjs/core';
import { PermissionsService } from 'src/permissions/permissions.service';
import { createToken, formatPermissions } from 'src/helpers/utils';
import { User } from 'src/user/entity/user.entity';
import { toUnixTime } from 'src/helpers/date';
import { EntityManager, LessThan, Not } from 'typeorm';
import { UserVerification } from 'src/user/entity/user-verification.entity';
import { CommonTableStatuses } from 'src/typings/common';

@Injectable()
export class RedisService {
  constructor(
    private readonly redisInitService: RedisInitService,
    private readonly redisHashService: RedisHashService,
    private readonly configService: ConfigService<EnvType, true>,
    private readonly moduleRef: ModuleRef,
    private readonly entityManager: EntityManager,
  ) {}

  private getKey(prefix: RedisKeys, token: string) {
    return `${prefix}:${token}`;
  }

  async getAccessToken(token: string): Promise<RedisAccessToken | false> {
    const user = await this.redisHashService.hgetall<RedisAccessToken>(
      this.getKey(RedisKeys.ACCESS_TOKEN, token),
    );
    if (user) {
      return user;
    }

    const userToken = await this.entityManager
      .createQueryBuilder(UserVerification, 'uv')
      .leftJoinAndSelect(User, 'u', 'u.status = :uStatus', {
        uStatus: CommonTableStatuses.ACTIVE,
      })
      .where('uv.token = :token', {
        token,
      })
      .andWhere('uv.status = :uvStatus', {
        uvStatus: CommonTableStatuses.ACTIVE,
      })
      .select(['uv.expiredAt', 'uv.createdAt', 'u.id', 'u.createdAt', 'u.type'])
      .getOne();
    if (
      !userToken ||
      !userToken.user ||
      (userToken.expiredAt + userToken.createdAt) * 1000 - Date.now() <= 0
    ) {
      return false;
    }

    const { id, permissions, createdAt } = userToken.user;

    await this.setAccessToken({ id, createdAt, permissions });

    return this.getAccessToken(token);
  }

  async setAccessToken(
    {
      id,
      createdAt,
      permissions,
    }: { id: number; createdAt: number; permissions: Record<string, number> },
    rememberMe = false,
  ) {
    const ttl = this.configService.get(
      rememberMe
        ? 'REDIS.REDIS_ACCESS_TOKEN_REMEMBER_ME_TTL'
        : 'REDIS.REDIS_ACCESS_TOKEN_TTL',
      { infer: true },
    );

    const token = createToken(
      this.configService.get('REDIS.REDIS_ACCESS_TOKEN_SECRET', {
        infer: true,
      }),
      `${id}-${createdAt}-${toUnixTime()}`,
    );

    const userId = id;

    return this.entityManager.transaction(async (trx) => {
      await trx.save(
        trx.getRepository(UserVerification).create({
          expiredAt: Math.floor(ttl / 1000),
          userId,
          token,
          rememberMe,
        }),
      );

      const payload: RedisAccessToken = {
        userId,
        permissions,
        createdAt,
        rememberMe,
      };

      const redisKey = this.getKey(RedisKeys.ACCESS_TOKEN, token);
      await this.redisHashService.hmset(redisKey, payload);
      await this.redisInitService.expire(redisKey, ttl);

      return token;
    });
  }

  async getPermissions(): Promise<RedisAllPermissions> {
    const permissions = this.redisHashService.hgetall<RedisAllPermissions>(
      RedisKeys.ALL_PERMISSIONS,
    );
    if (permissions) {
      return permissions;
    }
    await this.setPermissions();
    return this.getPermissions();
  }

  async setPermissions() {
    const permissionService = this.moduleRef.get(PermissionsService, {
      strict: false,
    });
    const perms = await permissionService.list(true);

    const formattedPermissions = formatPermissions(perms);

    await this.redisHashService.hmset(
      RedisKeys.ALL_PERMISSIONS,
      formattedPermissions,
    );
    await this.redisInitService.expire(
      RedisKeys.ALL_PERMISSIONS,
      this.configService.get('REDIS.REDIS_COMMON_TTL', { infer: true }),
    );
    return true;
  }
}
