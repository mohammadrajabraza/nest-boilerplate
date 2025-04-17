import { registerAs } from '@nestjs/config';
import { AuthConfig } from './config.type';
import validateConfig from '@/utils/validate-config';
import { IsString } from 'class-validator';
import { Algorithm } from 'jsonwebtoken';

class EnvironmentVariablesValidator {
  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsString()
  JWT_ACCESS_TOKEN_EXPIRY: string;

  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsString()
  JWT_REFRESH_TOKEN_EXPIRY: string;

  @IsString()
  JWT_CONFIRM_EMAIL_TOKEN_SECRET: string;

  @IsString()
  JWT_CONFIRM_EMAIL_TOKEN_EXPIRY: string;

  @IsString()
  JWT_PASSWORD_RESET_TOKEN_SECRET: string;

  @IsString()
  JWT_PASSWORD_RESET_TOKEN_EXPIRY: string;

  @IsString()
  JWT_ALGORITHM: string;

  @IsString()
  VERIFY_EMAIL_SUCCESS_REDIRECT: string;

  @IsString()
  VERIFY_EMAIL_ERROR_REDIRECT: string;
}

const transformExpiry = (value: string | null) => {
  if (value == null) return 0;
  // Handle both strings and numbers
  const stringValue = String(value).trim();
  const time = stringValue.slice(0, stringValue.length - 1);
  const unit = stringValue.charAt(stringValue.length - 1);
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

export default registerAs<AuthConfig>('auth', () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    access: {
      secret: config.JWT_ACCESS_TOKEN_SECRET,
      expiry: transformExpiry(config.JWT_ACCESS_TOKEN_EXPIRY),
    },
    refresh: {
      secret: config.JWT_REFRESH_TOKEN_SECRET,
      expiry: transformExpiry(config.JWT_REFRESH_TOKEN_EXPIRY),
    },
    'confirm-email': {
      secret: config.JWT_CONFIRM_EMAIL_TOKEN_SECRET,
      expiry: transformExpiry(config.JWT_CONFIRM_EMAIL_TOKEN_EXPIRY),
      redirect: {
        success: config.VERIFY_EMAIL_SUCCESS_REDIRECT,
        error: config.VERIFY_EMAIL_ERROR_REDIRECT,
      },
    },
    'password-reset': {
      secret: config.JWT_PASSWORD_RESET_TOKEN_SECRET,
      expiry: transformExpiry(config.JWT_PASSWORD_RESET_TOKEN_EXPIRY),
    },
    algorithm: config.JWT_ALGORITHM as Algorithm,
  } as AuthConfig;
});
