import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserT } from './user.interface';
import { FastifyRequest } from 'fastify';

export const User = createParamDecorator(
  (data: keyof UserT, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return data ? request.user?.[data] : request.user;
  },
);
