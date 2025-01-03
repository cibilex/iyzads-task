import { Injectable } from '@nestjs/common';
import { RedisInitService } from './redis-init.service';

@Injectable()
export class RedisStringService {
  constructor(private readonly redisInitService: RedisInitService) {}

  async set(
    key: string,
    value: string,
    expireInSeconds?: number,
  ): Promise<string> {
    if (expireInSeconds) {
      return this.redisInitService.redis.set(key, value, 'EX', expireInSeconds);
    }
    return this.redisInitService.redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redisInitService.redis.get(key);
  }

  async append(key: string, value: string): Promise<number> {
    return this.redisInitService.redis.append(key, value);
  }

  async strlen(key: string): Promise<number> {
    return this.redisInitService.redis.strlen(key);
  }
}
