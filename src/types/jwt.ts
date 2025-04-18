import { RoleType } from '@/constants/role-type';
import { TokenType } from '@/constants/token-type';
import { SessionDto } from '@/modules/auth/domain/session.dto';
import { TokenDto } from '@/modules/token/dtos/token.dto';
import { UserDto } from '@/modules/users/dtos/user.dto';

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

export type AccessPayload = {
  user: UserDto;
  session: SessionDto;
  token: TokenDto;
};

export type CustomRequest = Request & {
  user: AccessPayload;
};

export type RefreshPayload = {
  user: UserDto;
  session: SessionDto;
  token: TokenDto;
};
