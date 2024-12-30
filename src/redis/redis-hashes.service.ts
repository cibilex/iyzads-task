import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisHashService {
  constructor(private readonly redisService: RedisService) {}

  // Set a field in a hash
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redisService.redis.hset(key, field, value);
  }

  // Get a field from a hash
  async hget(key: string, field: string): Promise<string | null> {
    return this.redisService.redis.hget(key, field);
  }

  // Get all fields and values in a hash
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redisService.redis.hgetall(key);
  }

  // Delete one or more fields from a hash
  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.redisService.redis.hdel(key, ...fields);
  }

  // Increment the integer value of a field in a hash by a given number
  async hincrby(
    key: string,
    field: string,
    increment: number,
  ): Promise<number> {
    return this.redisService.redis.hincrby(key, field, increment);
  }

  // Get all values from a hash
  async hvals(key: string): Promise<string[]> {
    return this.redisService.redis.hvals(key);
  }

  // Set multiple fields in a hash at once
  async hmset(
    key: string,
    fieldsValues: Record<string, string>,
  ): Promise<string> {
    return this.redisService.redis.hmset(key, fieldsValues);
  }

  // Get all fields in a hash
  async hkeys(key: string): Promise<string[]> {
    return this.redisService.redis.hkeys(key);
  }

  // Check if a field exists in a hash
  async hexists(key: string, field: string): Promise<number> {
    return this.redisService.redis.hexists(key, field);
  }

  // Get the length of a hash (the number of fields)
  async hlen(key: string): Promise<number> {
    return this.redisService.redis.hlen(key);
  }
}
