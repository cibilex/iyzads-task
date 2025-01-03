import { PathImpl2 } from '@nestjs/config';
import { HashOptions, createHash } from 'crypto';
import { FastifyRequest } from 'fastify';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { GlobalException } from 'src/global/global.filter';
import { Permission } from 'src/v1/permissions/entity/permission.entity';
import { RedisAllPermissions } from 'src/redis/redis.interface';
import { User } from 'src/v1/user/entity/user.entity';

export function snakeCase(input: string): string {
  return input
    .replace(/(?:^|\.?)([A-Z])/g, (x, y) => '_' + y.toLowerCase())
    .replace(/^_/, '');
}

export const getUnusedBitValue = (list: number[]) => {
  for (let index = 0; index < 31; index++) {
    const value = 2 ** index;

    const has = list.filter((xx) => xx === value);
    if (!has.length) return value;
  }
  throw new GlobalException('errors.max_permission');
};

export const convertPrice = (price: string | number) => {
  return parseInt((parseFloat(price.toString()) * 100).toFixed(0));
};

export const createToken = (secret: HashOptions, payload: string) =>
  createHash('sha384', secret).update(payload).digest('hex');

export function getBearerToken(req: FastifyRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  if (token.length < 6) return false;
  return token;
}

export const formatPermissions = (
  permissions: Permission[],
): RedisAllPermissions => {
  return permissions.reduce<RedisAllPermissions>((prev, curr) => {
    if (!prev[curr.title]) prev[curr.title] = { id: curr.id, perms: {} };
    curr.permissionItems.forEach((pi) => {
      prev[curr.title].perms[pi.title] = {
        id: pi.id,
        v: pi.value,
      };
    });

    return prev;
  }, {});
};

export const groupArr = <T>(data: T[], length: number): Array<User[]> => {
  const group: any[] = [];
  for (let i = 0, j = 0; i < data.length; i++) {
    if (i >= length && i % length === 0) j++;
    group[j] = group[j] || [];
    group[j].push(data[i]);
  }
  return group;
};

export const getIpAddress = function (req: FastifyRequest): string {
  const cfConnectingIp = req.headers['cf-connecting-ip'];

  if (cfConnectingIp) {
    return cfConnectingIp as string;
  }

  const xForwardedFor = (req.headers['x-forwarded-for'] as string)
    ?.split(',')
    ?.shift();

  if (xForwardedFor) {
    return xForwardedFor;
  }

  return req.ip;
};

export class Response {
  constructor(
    public data: any,
    public message: PathImpl2<I18nTranslations> = 'success.completed',
    public args?: {
      property?: PathImpl2<I18nTranslations>;
      [key: string]: any;
    },
  ) {}
}
