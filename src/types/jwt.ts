import { RoleType } from '@/constants/role-type';
import { TokenType } from '@/constants/token-type';
import { SessionDto } from '@/modules/auth/domain/session.dto';
import { TokenDto } from '@/modules/token/domain/token.dto';
import { UserDto } from '@/modules/users/domain/user.dto';

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

export type SocialRequest<TProvider extends 'google'> = Request & {
  user: SocialUser<TProvider>;
};

export type RefreshPayload = {
  user: UserDto;
  session: SessionDto;
  token: TokenDto;
};

export type SocialUser<Provider extends 'google'> = {
  provider: Provider;
  providerId: string;
  email: string;
  name: string;
  picture: string;
};
