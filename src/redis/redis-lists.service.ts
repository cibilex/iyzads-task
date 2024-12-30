import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisListService {
  constructor(private readonly redisService: RedisService) {}

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.redisService.redis.rpush(key, ...values);
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.redisService.redis.lpush(key, ...values);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redisService.redis.lrange(key, start, stop);
  }

  async rpop(key: string): Promise<string | null> {
    return this.redisService.redis.rpop(key);
  }

  async lpop(key: string): Promise<string | null> {
    return this.redisService.redis.lpop(key);
  }

  async llen(key: string): Promise<number> {
    return this.redisService.redis.llen(key);
  }
}
