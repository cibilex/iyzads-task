import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import validate from './env/env.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { DbModule } from './db/db.module';
import { I18nModule } from './i18n/i18n.module';
import { RedisModule } from './redis/redis.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PermissionItemModule } from './permission-item/permission-item.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.MODE}`,
      isGlobal: true,
      validate,
    }),
    DbModule,
    I18nModule,
    UserModule,
    RedisModule,
    PermissionsModule,
    PermissionItemModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
