import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisStringService {
  constructor(private readonly redisService: RedisService) {}

  async set(
    key: string,
    value: string,
    expireInSeconds?: number,
  ): Promise<string> {
    if (expireInSeconds) {
      return this.redisService.redis.set(key, value, 'EX', expireInSeconds);
    }
    return this.redisService.redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redisService.redis.get(key);
  }

  async append(key: string, value: string): Promise<number> {
    return this.redisService.redis.append(key, value);
  }

  async strlen(key: string): Promise<number> {
    return this.redisService.redis.strlen(key);
  }
}
