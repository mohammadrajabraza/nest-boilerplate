import { RoleType } from '@/constants/role-type';
import successMessage from '@/constants/success-message';
import {
  EmailLoginResponseDto,
  LoginResponseDto,
} from '@/modules/auth/dtos/response/email-login.dto';
import {
  AuthTokenResponseDto,
  TokenPayload,
} from '@/modules/token/dtos/auth-token.dto';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { HttpStatus } from '@nestjs/common';

export class LoginMapper {
  static toDomain(
    user: UserEntity,
    role: RoleType,
    tokens: Record<'access' | 'refresh', { token: string; expiresIn: number }>,
  ) {
    const userData = user.toDto({ role });

    const tokensDto = new AuthTokenResponseDto();
    tokensDto.access = new TokenPayload();
    tokensDto.access.token = tokens.access.token;

    const accessExpiresIn = new Date();
    accessExpiresIn.setMilliseconds(
      accessExpiresIn.getMilliseconds() + tokens.access.expiresIn,
    );

    tokensDto.access.expiresIn = accessExpiresIn;

    tokensDto.refresh = new TokenPayload();
    tokensDto.refresh.token = tokens.refresh.token;

    const refreshExpiresIn = new Date();
    refreshExpiresIn.setMilliseconds(
      refreshExpiresIn.getMilliseconds() + tokens.refresh.expiresIn,
    );

    tokensDto.refresh.expiresIn = refreshExpiresIn;

    const data = new LoginResponseDto();
    data.user = userData;
    data.tokens = tokensDto;

    return new EmailLoginResponseDto(
      data,
      successMessage.AUTH.LOGIN,
      HttpStatus.OK,
    );
  }

  static toPersistence() {}
}
