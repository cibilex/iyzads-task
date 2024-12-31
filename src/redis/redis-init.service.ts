import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EnvType } from 'src/env/env.interface';

@Injectable()
export class RedisInitService implements OnModuleInit, OnModuleDestroy {
  redis: Redis;

  constructor(private readonly configService: ConfigService<EnvType, true>) {
    this.redis = new Redis({
      host: this.configService.get('REDIS.REDIS_HOST', { infer: true }),
      port: this.configService.get('REDIS.REDIS_PORT', { infer: true }),
      password: this.configService.get('REDIS.REDIS_PASSWORD', { infer: true }),
      db: this.configService.get('REDIS.REDIS_DB', { infer: true }),
    });
  }

  // Example common method (you can add more as needed)
  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.redis.exists(key);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.redis.expire(key, seconds);
  }

  async persist(key: string): Promise<number> {
    return this.redis.persist(key);
  }

  // Called when the module is initialized
  onModuleInit() {
    console.log('Redis client connected');
  }

  // Called when the module is destroyed
  onModuleDestroy() {
    this.redis.quit(); // Properly close the Redis connection when the app stops
  }
}
