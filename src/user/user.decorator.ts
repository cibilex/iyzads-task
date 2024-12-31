import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { RedisAccessToken } from 'src/redis/redis.interface';

export const User = createParamDecorator(
  (data: keyof RedisAccessToken, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return data ? request.user?.[data] : request.user;
  },
);
