import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigService } from '../typeorm-config.service';
import { RoleSeedModule } from './role/role-seed.module';
import { UserSeedModule } from './user/user-seed.module';
import { CompanySeedModule } from './company/company-seed.module';
import { SharedModule } from '@/shared/shared.module';
import config from '@/config';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    I18nModule.forRootAsync({
      useFactory: () => {
        return {
          fallbackLanguage: 'en',
          loaderOptions: {
            path: path.resolve(__dirname, '../../i18n/'),
          },
        };
      },
      resolvers: [AcceptLanguageResolver],
    }),
    CompanySeedModule,
    RoleSeedModule,
    UserSeedModule,
    SharedModule,
  ],
})
export class SeedModule {}
