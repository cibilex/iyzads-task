import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisSetService {
  constructor(private readonly redisService: RedisService) {}

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.redisService.redis.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.redisService.redis.srem(key, ...members);
  }

  async sismember(key: string, member: string): Promise<number> {
    return this.redisService.redis.sismember(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return this.redisService.redis.smembers(key);
  }

  async scard(key: string): Promise<number> {
    return this.redisService.redis.scard(key);
  }
}
