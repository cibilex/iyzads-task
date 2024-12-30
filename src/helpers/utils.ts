import { PathImpl2 } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { I18nTranslations } from 'src/generated/i18n.generated';

export function snakeCase(input: string): string {
  return input
    .replace(/(?:^|\.?)([A-Z])/g, (x, y) => '_' + y.toLowerCase())
    .replace(/^_/, '');
}

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

export const getIpAddress = function (req: FastifyRequest): string {
  const cfConnectingIp = req.headers['cf-connecting-ip'];

  if (cfConnectingIp) {
    return cfConnectingIp as string;
  }

  console.log(req.headers['x-forwarded-for'], "req.headers['x-forwarded-for']");

  const xForwardedFor = (req.headers['x-forwarded-for'] as string)
    ?.split(',')
    ?.shift();

  if (xForwardedFor) {
    return xForwardedFor;
  }

  return req.ip;
};
