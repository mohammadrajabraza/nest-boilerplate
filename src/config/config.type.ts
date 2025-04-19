import { TokenType } from '@/constants/token-type';
import { Algorithm } from 'jsonwebtoken';

export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;
  throttler: {
    ttl: number;
    limit: number;
  };
};

export type AuthConfig = {
  [TokenType.ACCESS]: {
    secret: string;
    expiry: number;
  };
  [TokenType.REFRESH]: {
    secret: string;
    expiry: number;
  };
  [TokenType.PASSWORD_RESET]: {
    secret: string;
    expiry: number;
  };
  [TokenType.CONFIRM_EMAIL]: {
    secret: string;
    expiry: number;
    redirect: {
      success: string;
      error: string;
    };
  };
  algorithm: Algorithm;
};

export type DatabaseConfig = {
  isDocumentDatabase: boolean;
  url?: string;
  type?: string;
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  username?: string;
  synchronize?: boolean;
  maxConnections: number;
  sslEnabled?: boolean;
  rejectUnauthorized?: boolean;
  ca?: string;
  key?: string;
  cert?: string;
};

export type MailConfig = {
  port: number;
  host?: string;
  user?: string;
  password?: string;
  defaultEmail?: string;
  defaultName?: string;
  ignoreTLS: boolean;
  secure: boolean;
  requireTLS: boolean;
  sendGrid: {
    apiKey: string;
    sender: string;
  };
};

export type GoogleConfig = {
  clientSecret: string;
  clientId: string;
  callbackUrl: string;
  scopes: string;
};

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  mail: MailConfig;
  google: GoogleConfig;
};
