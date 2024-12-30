import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvType } from 'src/env/env.interface';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvType, true>) => {
        return {
          port: configService.get('DB.DB_PORT', { infer: true }),
          host: configService.get('DB.DB_HOST', { infer: true }),
          database: configService.get('DB.DB_DATABASE', {
            infer: true,
          }) as string,
          username: configService.get('DB.DB_USERNAME', { infer: true }),
          password: configService.get('DB.DB_PASSWORD', { infer: true }),
          synchronize: configService.get('DB.DB_SYNCHRONIZE', { infer: true }),
          logging: false,
          autoLoadEntities: true,
          type: configService.get('DB.DB_TYPE', { infer: true }) as 'postgres',
          schema: configService.get('DB.DB_SCHEMA', { infer: true }),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DbModule {}
