import { PathImpl2 } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nTranslations } from 'src/generated/i18n.generated';

export class GlobalException extends HttpException {
  constructor(
    msg: PathImpl2<I18nTranslations>,
    {
      code,
      args,
      payload,
    }: {
      code?: HttpStatus.BAD_REQUEST;
      args?: {
        property?: PathImpl2<I18nTranslations>;
        [key: string]: string | number | undefined;
      };
      payload?: Record<string, any>;
    } = {},
  ) {
    super(
      { message: msg, args, payload: payload || {} },
      code || HttpStatus.BAD_REQUEST,
    );
  }
}
