import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisHashService {
  // constructor(private readonly RedisInitService: RedisInitService) {}
  // // Set a field in a hash
  // async hset(key: string, field: string, value: string): Promise<number> {
  //   return this.RedisInitService.redis.hset(key, field, value);
  // }
  // // Get a field from a hash
  // async hget(key: string, field: string): Promise<string | null> {
  //   return this.RedisInitService.redis.hget(key, field);
  // }
  // // Get all fields and values in a hash
  // async hgetall<T>(key: string): Promise<T> {
  //   return this.RedisInitService.redis.hgetall(key) as T;
  // }
  // // Delete one or more fields from a hash
  // async hdel(key: string, ...fields: string[]): Promise<number> {
  //   return this.RedisInitService.redis.hdel(key, ...fields);
  // }
  // // Increment the integer value of a field in a hash by a given number
  // async hincrby(
  //   key: string,
  //   field: string,
  //   increment: number,
  // ): Promise<number> {
  //   return this.RedisInitService.redis.hincrby(key, field, increment);
  // }
  // // Get all values from a hash
  // async hvals(key: string): Promise<string[]> {
  //   return this.RedisInitService.redis.hvals(key);
  // }
  // // Set multiple fields in a hash at once
  // async hmset(key: string, fieldsValues: Record<any, any>): Promise<string> {
  //   return this.RedisInitService.redis.hmset(key, fieldsValues);
  // }
  // // Get all fields in a hash
  // async hkeys(key: string): Promise<string[]> {
  //   return this.RedisInitService.redis.hkeys(key);
  // }
  // // Check if a field exists in a hash
  // async hexists(key: string, field: string): Promise<number> {
  //   return this.RedisInitService.redis.hexists(key, field);
  // }
  // // Get the length of a hash (the number of fields)
  // async hlen(key: string): Promise<number> {
  //   return this.RedisInitService.redis.hlen(key);
  // }
}
