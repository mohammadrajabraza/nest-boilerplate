import { RoleType } from '@/constants/role-type';
import { TokenType } from '@/constants/token-type';

export type JwtPayload = {
  userId: Uuid;
  role: RoleType;
  type: TokenType;
};

export type ConfirmEmailPayload = {
  userId: Uuid;
  email: string;
  role: RoleType;
  type: TokenType;
};

export type PassowrdResetPayload = {
  userId: Uuid;
  email: string;
  role: RoleType;
  type: TokenType;
};
