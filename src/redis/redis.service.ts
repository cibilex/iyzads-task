import { Injectable, OnModuleInit } from '@nestjs/common';
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
import { createToken, formatPermissions } from 'src/helpers/utils';
import { toUnixTime } from 'src/helpers/date';
import { EntityManager, Not } from 'typeorm';
import { UserVerification } from 'src/v1/user/entity/user-verification.entity';
import { CommonTableStatuses } from 'src/typings/common';
import { UserTypes } from 'src/v1/user/user.interface';
import { RedisStringService } from './redis-strings.service';
import { Permission } from 'src/v1/permissions/entity/permission.entity';

@Injectable()
export class RedisService implements OnModuleInit {
  constructor(
    private readonly redisInitService: RedisInitService,
    private readonly redisHashService: RedisHashService,
    private readonly redisStringService: RedisStringService,
    private readonly configService: ConfigService<EnvType, true>,
    private readonly moduleRef: ModuleRef,
    private readonly entityManager: EntityManager,
  ) {}

  private getKey(prefix: RedisKeys, token: string) {
    return `${prefix}:${token}`;
  }

  async getAccessToken(token: string): Promise<RedisAccessToken | false> {
    const user = await this.redisStringService.get(
      this.getKey(RedisKeys.ACCESS_TOKEN, token),
    );
    if (user) {
      return JSON.parse(user) as RedisAccessToken;
    }

    const userToken = await this.entityManager
      .createQueryBuilder(UserVerification, 'uv')
      .leftJoinAndSelect('uv.user', 'u', 'u.status = :uStatus', {
        uStatus: CommonTableStatuses.ACTIVE,
      })
      .where('uv.token = :token', {
        token,
      })
      .andWhere('uv.status = :uvStatus', {
        uvStatus: CommonTableStatuses.ACTIVE,
      })
      .select([
        'uv.expiredAt',
        'uv.createdAt',
        'u.id',
        'u.createdAt',
        'u.permissions',
        'u.type',
      ])
      .getOne();
    if (!userToken || userToken.expiredAt < Date.now()) {
      return false;
    }

    const { id, permissions, createdAt, type } = userToken.user;

    await this.insertToken(
      userToken.token,
      {
        userId: id,
        createdAt,
        permissions,
        userType: type,
        rememberMe: userToken.rememberMe,
      },
      Math.round(userToken.expiredAt - Date.now() / 1000),
    );

    return this.getAccessToken(token);
  }

  async setAccessToken(
    {
      id,
      createdAt,
      permissions,
      type,
    }: {
      id: number;
      createdAt: number;
      type: UserTypes;
      permissions: Record<string, number>;
    },
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
          expiredAt: Math.round(ttl + Date.now() / 1000),
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
        userType: type,
      };
      await this.insertToken(token, payload, ttl);

      return token;
    });
  }

  private insertToken(token: string, payload: RedisAccessToken, ttl: number) {
    const redisKey = this.getKey(RedisKeys.ACCESS_TOKEN, token);
    return this.redisStringService.set(redisKey, JSON.stringify(payload), ttl);
  }

  async getPermissions(): Promise<RedisAllPermissions> {
    const permissions = await this.redisStringService.get(
      RedisKeys.ALL_PERMISSIONS,
    );

    if (permissions) {
      return JSON.parse(permissions) as RedisAllPermissions;
    }

    await this.setPermissions();
    return this.getPermissions();
  }

  async getAllPermissions(manager: EntityManager) {
    return manager
      .createQueryBuilder(Permission, 'p')
      .leftJoinAndSelect('p.permissionItems', 'pi', 'pi.status != :piStatus', {
        piStatus: CommonTableStatuses.DELETED,
      })
      .where('p.status != :status', {
        status: CommonTableStatuses.DELETED,
      })
      .select(['p.id', 'p.title', 'pi.id', 'pi.title', 'pi.value'])
      .orderBy('p.createdAt', 'DESC')
      .getMany();
  }

  async setPermissions(manager?: EntityManager) {
    const trx = manager || this.entityManager;
    const perms = await this.getAllPermissions(trx);

    const formattedPermissions = formatPermissions(perms);

    await this.redisStringService.set(
      RedisKeys.ALL_PERMISSIONS,
      JSON.stringify(formattedPermissions),
      +this.configService.get('REDIS.REDIS_COMMON_TTL', { infer: true }),
    );
    return true;
  }

  async delAccessToken(token: string) {
    await Promise.all([
      this.redisInitService.del(this.getKey(RedisKeys.ACCESS_TOKEN, token)),
      this.entityManager.update(
        UserVerification,
        { token, status: Not(CommonTableStatuses.ACTIVE) },
        { status: CommonTableStatuses.DELETED },
      ),
    ]);
  }

  async onModuleInit() {
    await this.setPermissions();
    console.info('Redis permissions updated');
  }
}
