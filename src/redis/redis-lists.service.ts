import { Injectable } from '@nestjs/common'
import { RedisInitService } from './redis-init.service'

@Injectable()
export class RedisListService {
  constructor(private readonly RedisInitService: RedisInitService) {}

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.RedisInitService.redis.rpush(key, ...values)
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.RedisInitService.redis.lpush(key, ...values)
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.RedisInitService.redis.lrange(key, start, stop)
  }

  async rpop(key: string): Promise<string | null> {
    return this.RedisInitService.redis.rpop(key)
  }

  async lpop(key: string): Promise<string | null> {
    return this.RedisInitService.redis.lpop(key)
  }

  async llen(key: string): Promise<number> {
    return this.RedisInitService.redis.llen(key)
  }
}
