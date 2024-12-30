import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { Public } from 'src/public/public.decorator';
import { toUnixTime } from 'src/helpers/date';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    req.time = toUnixTime();

    const isPublic = await this.checkVisibility(ctx);
    if (isPublic) return true;

    const bearerToken = this.getBearerToken(req);
    if (!bearerToken) throw new UnauthorizedException();

    return true;
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
    if (auth) return true;
  }
}
