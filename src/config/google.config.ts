import { registerAs } from '@nestjs/config';
import { GoogleConfig } from './config.type';
import validateConfig from '@/utils/validate-config';
import { IsString } from 'class-validator';

class EnvironmentVariablesValidator {
  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CALLBACK_URL: string;

  @IsString()
  GOOGLE_AUTH_SCOPES: string;

  @IsString()
  GOOGLE_SUCCESS_REDIRECT: string;

  @IsString()
  GOOGLE_ERROR_REDIRECT: string;
}

export default registerAs<GoogleConfig>('google', () => {
  const config = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackUrl: config.GOOGLE_CALLBACK_URL,
    scopes: config.GOOGLE_AUTH_SCOPES,
    redirect: {
      success: config.GOOGLE_SUCCESS_REDIRECT,
      error: config.GOOGLE_ERROR_REDIRECT,
    },
  } as GoogleConfig;
});
