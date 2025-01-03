import { RedisAccessToken } from './../redis/redis.interface';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { Auth, Public } from 'src/public/public.decorator';
import { toUnixTime } from 'src/helpers/date';
import { RedisService } from 'src/redis/redis.service';
import { UserTypes } from 'src/user/user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    req.time = toUnixTime();

    const isPublic = await this.checkVisibility(ctx);
    if (isPublic) {
      return true;
    }

    const bearerToken = this.getBearerToken(req);
    if (!bearerToken) {
      throw new UnauthorizedException();
    }

    const user = await this.redisService.getAccessToken(bearerToken);
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.checkPermissions(ctx, user);
    req.user = user;

    return true;
  }

  private async checkPermissions(
    ctx: ExecutionContext,
    user: RedisAccessToken,
  ) {
    if (user.userType === UserTypes.ADMIN) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndMerge(Auth, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    const allPermissions = await this.redisService.getPermissions();

    for (const permission of requiredPermissions) {
      const [page, action] = permission.split('.');
      const targetPermission =
        allPermissions[page] && allPermissions[page]?.perms[action];
      const userPermissions = user.permissions;

      if (
        !targetPermission ||
        !userPermissions[page] ||
        !(userPermissions[page] & targetPermission.v)
      ) {
        throw new ForbiddenException();
      }
    }
  }

  private getBearerToken(req: FastifyRequest) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.substring(7);
    if (token.length < 6) return false;
    return token;
  }

  private checkVisibility(ctx: ExecutionContext) {
    const auth = this.reflector.getAllAndOverride(Public, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (auth) {
      return true;
    }
  }
}
