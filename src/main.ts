import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvType, Mode } from './env/env.interface';
import { getMetadataStorage, ValidationError } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';
import { snakeCase } from './helpers/utils';
import { ResponseInterceptor } from './response/response.interceptor';
import redactions from './data/reductions';
import { randomUUID } from 'crypto';
import { addSwagger } from './lib/swagger';

console.log(process.env);

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        redact: redactions,
      },
      genReqId: () => randomUUID(),
      disableRequestLogging: false,
    }),
    {
      cors: true,
    },
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      enableDebugMessages: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validateCustomDecorators: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const i18n = I18nContext.current();

        return new BadRequestException(
          [
            ...validationErrors,
            ...validationErrors.map((item) => item.children || []).flat(),
            ...validationErrors
              .map((item) =>
                (item.children || []).map((cell) => cell.children || []).flat(),
              )
              .flat(),
          ]
            .map((error) => {
              const prototype = Object.getPrototypeOf(
                error.target!.constructor,
              );
              const prototypeLimits =
                getMetadataStorage().getTargetValidationMetadatas(
                  prototype,
                  prototype.name,
                  true,
                  false,
                );
              const limits = getMetadataStorage().getTargetValidationMetadatas(
                error.target!.constructor,
                error.target!.constructor.name,
                true,
                false,
              );

              limits.forEach((item) =>
                prototypeLimits.forEach((prototypeItem) => {
                  if (
                    item.propertyName === prototypeItem.propertyName &&
                    prototypeItem.name === item.name
                  ) {
                    item.constraints =
                      prototypeItem.constraints || item.constraints;
                  }
                }),
              );

              const contraints = Object.keys(error.constraints || []).map(
                (key) => {
                  const limit = limits.find(
                    (meta) =>
                      meta.propertyName === error.property && meta.name === key,
                  );

                  return i18n?.t('validation.' + snakeCase(key), {
                    lang: i18n?.lang,
                    args: {
                      limit: limit?.constraints && limit?.constraints[0],
                      property: error.property,
                    },
                  });
                },
              );

              return contraints;
            })
            .flat(),
        );
      },
    }),
  );

  const configService = app.get(ConfigService<EnvType, true>);

  console.log(process.env);

  const isDev =
    configService.get('NODE_ENV', {
      infer: true,
    }) === Mode.DEV;
  if (!isDev) {
    // app.use(fastifyHelmet);
  }

  const port = configService.get('PORT', {
    infer: true,
  });

  addSwagger(app);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
