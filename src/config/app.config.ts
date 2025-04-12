import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';
import validateConfig from '@/utils/validate-config';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(
    ({ value }) => {
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
    },
    { toClassOnly: true },
  )
  @IsInt({ message: 'APP_PORT must be an integer' })
  @Min(0, { message: 'APP_PORT must be at least 0' })
  @Max(65535, { message: 'APP_PORT must not exceed 65535' })
  APP_PORT: number;

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
}

export default registerAs<AppConfig>('app', () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: config.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'app',
    workingDirectory: process.env.PWD || process.cwd(),
    frontendDomain: config.FRONTEND_DOMAIN,
    backendDomain: config.BACKEND_DOMAIN ?? 'http://localhost',
    port:
      config.APP_PORT ??
      (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000),
    apiPrefix: config.API_PREFIX || 'api',
    fallbackLanguage: config.APP_FALLBACK_LANGUAGE || 'en',
    headerLanguage: config.APP_HEADER_LANGUAGE || 'x-custom-lang',
  };
});
