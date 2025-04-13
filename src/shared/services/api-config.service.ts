import path from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from '@/utils/snake-naming';
import { AllConfigType } from '@/config/config.type';
import { DatabaseType } from 'typeorm';
import { NestedKeyOf } from '@/types';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService<AllConfigType>) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get documentationEnabled(): boolean {
    return this.nodeEnv !== 'production';
  }

  get localeMapping(): Record<string, string> {
    return {
      en: 'en_US',
      'en-US': 'en_US',
      en_US: 'en_US',
      ru: 'ru_RU',
      'ru-RU': 'ru_RU',
      ru_RU: 'ru_RU',
    };
  }

  get nodeEnv(): string {
    return this.get('app.nodeEnv');
  }

  get fallbackLanguage(): string {
    return this.get('app.fallbackLanguage');
  }

  get languageHeader(): string {
    return this.get('app.headerLanguage');
  }

  get postgresConfig(): TypeOrmModuleOptions {
    const entities = [
      path.join(__dirname, `../../modules/**/*.entity{.ts,.js}`),
      path.join(__dirname, `../../modules/**/*.view-entity{.ts,.js}`),
    ];
    const migrations = [
      path.join(__dirname, `../../database/migrations/*{.ts,.js}`),
    ];

    return {
      entities,
      migrations,
      type: this.get('database.type') as DatabaseType,
      host: this.get('database.host'),
      port: this.get('database.port'),
      username: this.get('database.username'),
      password: this.get('database.password'),
      database: this.get('database.name'),
      synchronize: this.get('database.synchronize'),
      logging: this.nodeEnv !== 'production',
      dropSchema: this.isTest,
      namingStrategy: new SnakeNamingStrategy(),
      keepConnectionAlive: true,
    } as TypeOrmModuleOptions;
  }

  get extraPostgresConfig(): TypeOrmModuleOptions['extra'] {
    return {
      // based on https://node-postgres.com/apis/pool
      // max connection pool size
      max: this.get('database.maxConnections'),
      ssl: this.get('database.sslEnabled')
        ? {
            rejectUnauthorized: this.get('database.rejectUnauthorized'),
            ca: this.get('database.ca') ?? undefined,
            key: this.get('database.key') ?? undefined,
            cert: this.get('database.cert') ?? undefined,
          }
        : undefined,
    } as TypeOrmModuleOptions['extra'];
  }

  get appConfig() {
    return {
      name: this.get('app.name'),
      port: this.get('app.port'),
    };
  }

  private get<TKey extends NestedKeyOf<AllConfigType>>(key: TKey) {
    const value = this.configService.get(key, { infer: true });

    if (value == null) {
      throw new Error(`${key} environment variable does not set`);
    }

    return value;
  }
}
