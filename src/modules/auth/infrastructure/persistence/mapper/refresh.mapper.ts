import successMessage from '@/constants/success-message';
import {
  RefreshResponseDto,
  RefreshTokenResponseDto,
} from '@/modules/auth/dtos/response/refresh-token.dto';
import {
  AuthTokenResponseDto,
  TokenPayload,
} from '@/modules/roles/dtos/response/auth-token.dto';
import { HttpStatus } from '@nestjs/common';

export class RefreshTokenMapper {
  static toDomain(
    tokens: Record<'access' | 'refresh', { token: string; expiresIn: number }>,
  ) {
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

    const data = new RefreshResponseDto();
    data.tokens = tokensDto;

    return new RefreshTokenResponseDto(
      data,
      successMessage.AUTH.REFRESH_TOKEN,
      HttpStatus.OK,
    );
  }

  static toPersistence() {}
}
