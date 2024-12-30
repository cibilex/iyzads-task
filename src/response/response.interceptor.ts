import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { I18nContext, I18nValidationExceptionFilter } from 'nestjs-i18n';
import { Observable, catchError, map, throwError } from 'rxjs';
import { getIpAddress, Response } from 'src/helpers/utils';

@Injectable()
export class ResponseInterceptor<T>
  extends I18nValidationExceptionFilter
  implements NestInterceptor<T>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();
    const req = ctx.getRequest<FastifyRequest>();

    return next.handle().pipe(
      map(async (data: Response | any) => {
        return await this.exec(this.responseHandler.bind(this), data, res, req);
      }),
      catchError((err: HttpException) =>
        throwError(
          async () =>
            await this.exec(this.errorHandler.bind(this), err, res, req, true),
        ),
      ),
    );
  }

  private async write(
    req: FastifyRequest,
    res: FastifyReply,
    response: any,
    err: any,
  ) {
    const { log, body, url, user, method, headers, query, params } = req;
    const ip = getIpAddress(req);

    const responseData = (err && response) || undefined;
    const error = err?.response || err || undefined;

    log.info({
      response: responseData,
      err: error,
      reqBody: body,
      url,
      ip,
      userId: user?.id,
      method,
      responseTime: Math.round(res.elapsedTime),
    });
  }

  private async exec(
    fn: typeof this.errorHandler | typeof this.responseHandler,
    data: any,
    res: FastifyReply,
    req: FastifyRequest,
    isError = false,
  ) {
    const response = fn(data, res);

    await this.write(req, res, response, isError && data);
    return response;
  }

  private getErrorResponse(err: any) {
    const i18n = I18nContext.current();

    const error =
      err instanceof HttpException ? err : new InternalServerErrorException();
    const response = error.getResponse() as {
      message?: string;
      args?: Record<string, any>;
      payload?: any;
    };

    const message = (response.message || error.message) as any;
    const status = error.getStatus();

    return {
      message:
        typeof message === 'string'
          ? i18n?.t(
              message.split(' ').length > 1 ? 'errors.' + status : message,
              {
                args: response.args,
                lang: i18n?.lang,
              },
            ) || error.message
          : message.appMessage || message,
      ...(response.payload || {}),
      status: error.getStatus(),
    };
  }

  errorHandler(err: any, res: FastifyReply) {
    console.log(err, 'err');

    const reply = this.getErrorResponse(err);
    const response = {
      ...reply,
      success: false,
    };

    res.status(reply.status).send(response);
    return response;
  }

  private responseHandler(data: any | Response, res: FastifyReply) {
    const isInstance = typeof data === 'object' && 'message' in data;
    const i18n = I18nContext.current();
    return {
      data: isInstance ? data.data : data,
      status: res.statusCode,
      success: true,
      message: isInstance
        ? i18n?.t(isInstance ? data.message : 'success.completed', {
            args: data.args,
            lang: i18n?.lang,
          })
        : undefined,
    };
  }
}
