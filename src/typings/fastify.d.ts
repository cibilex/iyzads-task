import { RedisAccessToken } from 'src/redis/redis.interface';

declare module 'fastify' {
  export interface FastifyRequest {
    user: RedisAccessToken;
    time: number;
  }
}
