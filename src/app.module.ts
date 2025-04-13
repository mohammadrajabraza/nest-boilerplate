import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig, databaseConfig } from './config';
import { SharedModule } from './shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ApiConfigService } from './shared/services/api-config.service';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { ClsModule, ClsMiddleware } from 'nestjs-cls';
import path from 'path';
import { TestController } from './test/test.controller';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    SharedModule,
    ThrottlerModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) => ({
        throttlers: [configService.throttlerConfigs],
      }),
      inject: [ApiConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env'],
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false },
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useClass: TypeOrmConfigService,
      inject: [ApiConfigService],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ApiConfigService) => {
        const i18nPath = path.join(__dirname, 'i18n/');
        return {
          fallbackLanguage: configService.fallbackLanguage,
          loaderOptions: {
            path: i18nPath,
            watch: configService.isDevelopment,
            includeSubfolders: true,
          },
          parserOptions: {
            transform: (locale: string) =>
              configService.localeMapping?.[locale] || locale,
          },
        };
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        {
          use: HeaderResolver,
          useFactory: () => ['x-locale'],
          inject: [ApiConfigService],
        },
      ],
      imports: [SharedModule],
      inject: [ApiConfigService],
    }),
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ClsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
