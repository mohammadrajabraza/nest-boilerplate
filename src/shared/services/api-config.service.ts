import path from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from '@/utils/snake-naming';
import { AllConfigType, AuthConfig } from '@/config/config.type';
import { DatabaseType } from 'typeorm';
import { NestedKeyOf } from '@/types';
import { ThrottlerOptions } from '@nestjs/throttler';
import { TokenType } from '@/constants/token-type';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

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

  get throttlerConfigs(): ThrottlerOptions {
    return {
      ttl: this.get('app.throttler.ttl'),
      limit: this.get('app.throttler.limit'),
      // storage: new ThrottlerStorageRedisService(new Redis(this.redis)),
    };
  }

  get apiPrefix() {
    return this.get('app.apiPrefix');
  }

  get sendGridConfig() {
    return {
      apiKey: this.get('mail.sendGrid.apiKey'),
      sender: this.get('mail.sendGrid.sender'),
    };
  }

  get googleConfig() {
    return {
      clientSecret: this.get('google.clientSecret'),
      clientID: this.get('google.clientId'),
      callbackURL: this.get('google.callbackUrl'),
      scope: this.get('google.scopes').split(','),
    };
  }

  get mailConfig(): SMTPTransport.Options {
    return {
      host: this.get('mail.host'),
      port: this.get('mail.port'),
      ignoreTLS: this.get('mail.ignoreTLS'),
      secure: this.get('mail.secure'),
      requireTLS: this.get('mail.requireTLS'),
      auth: {
        user: this.get('mail.user'),
        pass: this.get('mail.password'),
      },
    };
  }

  get defaultMail(): { name: string; email: string } {
    return {
      name: this.get('mail.defaultName'),
      email: this.get('mail.defaultEmail'),
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

  get authConfig(): AuthConfig {
    return {
      [TokenType.ACCESS]: {
        secret: this.get('auth.access.secret'),
        expiry: this.get('auth.access.expiry'),
      },
      [TokenType.REFRESH]: {
        secret: this.get('auth.refresh.secret'),
        expiry: this.get('auth.refresh.expiry'),
      },
      [TokenType.CONFIRM_EMAIL]: {
        secret: this.get('auth.refresh.secret'),
        expiry: this.get('auth.refresh.expiry'),
        redirect: {
          success: this.get('auth.confirm-email.redirect.success'),
          error: this.get('auth.confirm-email.redirect.error'),
        },
      },
      [TokenType.PASSWORD_RESET]: {
        secret: this.get('auth.refresh.secret'),
        expiry: this.get('auth.refresh.expiry'),
      },
      algorithm: this.get('auth.algorithm'),
    };
  }

  get postgresConfig(): TypeOrmModuleOptions {
    const entities = [
      path.join(__dirname, `../../modules/**/*.entity{.ts,.js}`),
      path.join(__dirname, `../../modules/**/*.view-entity{.ts,.js}`),
    ];
    const migrations = [
      path.join(__dirname, `../../database/migrations/*{.ts,.js}`),
    ];

    // const subscribers = [
    //   path.join(__dirname, '../../modules/**/*.subscriber{.ts,.js}'),
    // ];

    return {
      entities,
      migrations,
      // subscribers,
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

  get frontendDomain() {
    return this.get('app.frontendDomain');
  }

  get backendDomain() {
    return this.get('app.backendDomain');
  }

  get workingDirectory() {
    return this.get('app.workingDirectory');
  }

  get s3BucketName() {
    return this.get('aws.s3.bucketName');
  }

  get imageUploadConfig() {
    return {
      maxFileSize: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg'],
    };
  }

  get awsConfig() {
    return {
      region: this.get('aws.region'),
      accessKeyId: this.get('aws.accessKey'),
      secretAccessKey: this.get('aws.secretAccess'),
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
