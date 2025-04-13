import { registerAs } from '@nestjs/config';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import validateConfig from '@/utils/validate-config';
import { DatabaseConfig } from './config.type';

class EnvironmentVariablesValidator {
  @IsString()
  DATABASE_TYPE: string;

  @IsString()
  DATABASE_HOST: string;
  @IsOptional()
  @Transform(
    ({ value }) => {
      if (value == null) return undefined;
      // Handle both strings and numbers
      const stringValue = String(value).trim();
      if (!/^\d+$/.test(stringValue)) {
        throw new Error(
          `DATABASE_PORT must be a valid integer, received: "${stringValue}"`,
        );
      }
      const parsed = parseInt(stringValue, 10);
      if (isNaN(parsed) || parsed < 0 || parsed > 65535) {
        throw new Error(
          `DATABASE_PORT must be between 0 and 65535, received: ${parsed}`,
        );
      }
      return parsed;
    },
    { toClassOnly: true },
  )
  @IsInt({ message: 'DATABASE_PORT must be an integer' })
  @Min(0, { message: 'DATABASE_PORT must be at least 0' })
  @Max(65535, { message: 'DATABASE_PORT must not exceed 65535' })
  DATABASE_PORT: number;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  DATABASE_USERNAME: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  DATABASE_SYNCHRONIZE: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1, { message: 'DATABASE_MAX_CONNECTIONS must be at least 1' })
  DATABASE_MAX_CONNECTIONS: number;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  DATABASE_SSL_ENABLED: string;

  @IsOptional()
  @IsBoolean()
  DATABASE_REJECT_UNAUTHORIZED: boolean;

  @IsString()
  @IsOptional()
  DATABASE_CA: string;

  @IsString()
  @IsOptional()
  DATABASE_KEY: string;

  @IsString()
  @IsOptional()
  DATABASE_CERT: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    isDocumentDatabase: ['mongodb'].includes(config.DATABASE_TYPE ?? ''),
    type: config.DATABASE_TYPE,
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT ?? 5432,
    password: config.DATABASE_PASSWORD,
    name: config.DATABASE_NAME,
    username: config.DATABASE_USERNAME,
    synchronize: config.DATABASE_SYNCHRONIZE === 'true',
    maxConnections: config.DATABASE_MAX_CONNECTIONS ?? 100, // Use transformed number
    sslEnabled: config.DATABASE_SSL_ENABLED === 'true',
    rejectUnauthorized: config.DATABASE_REJECT_UNAUTHORIZED,
    ca: config.DATABASE_CA,
    key: config.DATABASE_KEY,
    cert: config.DATABASE_CERT,
  };
});
