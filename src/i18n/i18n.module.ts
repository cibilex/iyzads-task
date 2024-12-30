import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nYamlLoader,
  I18nModule as LangModule,
} from 'nestjs-i18n';
import { join } from 'path';
import { EnvType } from 'src/env/env.interface';

@Module({
  imports: [
    LangModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvType, true>) => ({
        fallbackLanguage: configService.get('FALLBACK_LANGUAGE', {
          infer: true,
        }) as string,
        loaderOptions: {
          path: join(__dirname, '/data/'),
          watch: true,
        },
        typesOutputPath: join(
          __dirname,
          '../../src/generated/i18n.generated.ts',
        ),
      }),
      loader: I18nYamlLoader,
      resolvers: [AcceptLanguageResolver, new HeaderResolver(['x-lang'])],
    }),
  ],
})
export class I18nModule {}
