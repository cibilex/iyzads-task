import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import validate from './env/env.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { DbModule } from './db/db.module';
import { I18nModule } from './i18n/i18n.module';
import { RedisModule } from './redis/redis.module';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EnvType } from './env/env.interface';
import { V1Module } from './v1/v1.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvType, true>) => [
        {
          limit: configService.get('RATE_LIMIT', { infer: true }),
          ttl: 60000,
        },
      ],
      inject: [ConfigService],
    }),
    DbModule,
    I18nModule,
    RedisModule,
    V1Module,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
