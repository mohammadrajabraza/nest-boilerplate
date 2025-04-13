import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';
import validateConfig from '@/utils/validate-config';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsOptional()
  @IsString()
  APP_PORT: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_DOMAIN: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  BACKEND_DOMAIN: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_HEADER_LANGUAGE: string;

  @IsOptional()
  @IsString()
  THROTTLER_TTL: string; // seconds

  @IsOptional()
  @IsString()
  THROTTLER_LIMIT: string;
}

const transformAppPort = (value: string | null) => {
  if (value == null) return undefined;
  // Handle both strings and numbers
  const stringValue = String(value).trim();
  if (!/^\d+$/.test(stringValue)) {
    throw new Error(
      `APP_PORT must be a valid integer, received: "${stringValue}"`,
    );
  }
  const parsed = parseInt(stringValue, 10);
  if (isNaN(parsed) || parsed < 0 || parsed > 65535) {
    throw new Error(
      `APP_PORT must be between 0 and 65535, received: ${parsed}`,
    );
  }
  return parsed;
};

const transformThrollerTTl = (value: string | null) => {
  if (value == null) return 0;
  // Handle both strings and numbers
  const stringValue = String(value).trim();
  const [time, unit] = stringValue.split('-');
  if (!time || isNaN(Number(time))) {
    throw new Error('Invalid time value');
  }
  const unitsInSeconds = {
    ms: 1 / 1000,
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    M: 2629800, // approx. 1 month
    y: 31557600, // approx. 1 year
  };
  if (!unit || !(unit in unitsInSeconds)) {
    throw new Error('Invalid unit value');
  }

  return unitsInSeconds[unit] * Number(time);
};

export default registerAs<AppConfig>('app', () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: config.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'app',
    workingDirectory: process.env.PWD || process.cwd(),
    frontendDomain: config.FRONTEND_DOMAIN,
    backendDomain: config.BACKEND_DOMAIN ?? 'http://localhost',
    port:
      transformAppPort(config.APP_PORT) ??
      (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000),
    apiPrefix: config.API_PREFIX || 'api',
    fallbackLanguage: config.APP_FALLBACK_LANGUAGE || 'en',
    headerLanguage: config.APP_HEADER_LANGUAGE || 'x-custom-lang',
    throttler: {
      ttl: transformThrollerTTl(config.THROTTLER_TTL),
      limit:
        config.THROTTLER_LIMIT && !isNaN(Number(config.THROTTLER_LIMIT))
          ? Number(config.THROTTLER_LIMIT)
          : 0,
    },
  };
});
