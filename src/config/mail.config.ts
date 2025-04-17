import { registerAs } from '@nestjs/config';

import { IsString, IsOptional, IsEmail, IsIn } from 'class-validator';
import validateConfig from '../utils/validate-config';
import { MailConfig } from './config.type';

class EnvironmentVariablesValidator {
  @IsOptional()
  @IsString()
  MAIL_PORT: string;

  @IsString()
  MAIL_HOST: string;

  @IsString()
  @IsOptional()
  MAIL_USER: string;

  @IsString()
  @IsOptional()
  MAIL_PASSWORD: string;

  @IsEmail()
  MAIL_DEFAULT_EMAIL: string;

  @IsString()
  MAIL_DEFAULT_NAME: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  MAIL_IGNORE_TLS: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  MAIL_SECURE: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  MAIL_REQUIRE_TLS: string;

  @IsString()
  SEND_GRID_API_KEY: string;

  @IsString()
  SEND_GRID_SENDER: string;
}

export default registerAs<MailConfig>('mail', () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    port: config.MAIL_PORT ? parseInt(config.MAIL_PORT, 10) : 587,
    host: config.MAIL_HOST,
    user: config.MAIL_USER,
    password: config.MAIL_PASSWORD,
    defaultEmail: config.MAIL_DEFAULT_EMAIL,
    defaultName: config.MAIL_DEFAULT_NAME,
    ignoreTLS: config.MAIL_IGNORE_TLS === 'true',
    secure: config.MAIL_SECURE === 'true',
    requireTLS: config.MAIL_REQUIRE_TLS === 'true',
    sendGrid: {
      apiKey: config.SEND_GRID_API_KEY,
      sender: config.SEND_GRID_SENDER,
    },
  } as MailConfig;
});
