import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import validate from './env/env.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { DbModule } from './db/db.module';
import { I18nModule } from './i18n/i18n.module';
import { RedisModule } from './redis/redis.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PermissionItemModule } from './permission-item/permission-item.module';
import { BookstoreModule } from './bookstore/bookstore.module';
import { BookModule } from './book/book.module';
import { InventoryModule } from './inventory/inventory.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EnvType } from './env/env.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.MODE}`,
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
    UserModule,
    PermissionsModule,
    PermissionItemModule,
    BookstoreModule,
    BookModule,
    InventoryModule,
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
