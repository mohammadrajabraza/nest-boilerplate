import errorMessage from '@/constants/error-message';
import { TokenType } from '@/constants/token-type';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { ConfirmEmailPayload, JwtPayload, PassowrdResetPayload } from '@/types/jwt';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenEntity } from './infrastructure/persistence/entities/token.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { TokenDto } from './domain/token.dto';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private apiConfigService: ApiConfigService,
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
  ) {}

  public async createToken({
    token,
    tokenType,
    expiresIn,
  }: {
    token: string;
    tokenType: TokenType;
    expiresIn: number;
  }) {
    try {
      const expiresAt = new Date();
      expiresAt.setMilliseconds(expiresAt.getMilliseconds() + expiresIn);

      return await this.tokenRepository.save(
        plainToInstance(TokenEntity, {
          token,
          tokenType,
          expiresAt,
          issuedAt: new Date(),
          isRevoked: false,
        }),
      );
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.TOKEN.CREATION_FAILED);
    }
  }

  public async revokeToken(token: TokenDto) {
    try {
      await this.tokenRepository.update({ id: token.id }, { isRevoked: true });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.TOKEN.REVOKE_FAILED);
    }
  }

  public async getToken(token: string, tokenType: TokenType) {
    try {
      const tokenEntity = await this.tokenRepository.findOne({
        where: { token },
      });
      if (!tokenEntity) {
        throw new NotFoundException(errorMessage.TOKEN.NOT_FOUND);
      }
      if (tokenEntity.tokenType !== tokenType) {
        throw new NotFoundException(errorMessage.TOKEN.INVALID_TYPE);
      }
      if (new Date(tokenEntity.expiresAt).getTime() < new Date().getTime() || tokenEntity.isRevoked) {
        throw new UnauthorizedException(errorMessage.TOKEN.EXPIRED);
      }
      return tokenEntity;
    } catch (error) {
      Logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(errorMessage.TOKEN.GET_TOKEN_FAILED);
    }
  }

  private async signToken<TPayload extends object & { userId: Uuid }, TTokenType extends TokenType>(
    payload: TPayload,
    tokenType: TTokenType,
  ) {
    try {
      const tokenConfig = this.apiConfigService.authConfig[tokenType];
      const token = this.jwtService.sign(
        { payload },
        {
          secret: tokenConfig.secret,
          issuer: payload.userId,
          expiresIn: tokenConfig.expiry,
        },
      );

      await this.createToken({
        token,
        tokenType,
        expiresIn: tokenConfig.expiry * 1000,
      });
      return { token, expiresIn: tokenConfig.expiry * 1000 };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(`Cannot sign ${tokenType} token`);
    }
  }

  private handleJwtError(error: unknown) {
    if (error instanceof JsonWebTokenError) {
      const errors = {
        [TokenExpiredError.name]: 'Token has been expired',
        [NotBeforeError.name]: 'Token has been expired',
        [JsonWebTokenError.name]: 'Invalid token',
      };
      const message = errors[error.name];
      return new UnauthorizedException(message);
    }

    if (error instanceof HttpException) {
      return error;
    }

    return new InternalServerErrorException('Cannot verify access token');
  }

  private async verifyToken<TPayload extends object & { userId: Uuid }, TTokenType extends TokenType>(
    token: string,
    tokenType: TTokenType,
  ) {
    try {
      const tokenDoc = await this.getToken(token, tokenType);
      const tokenConfig = this.apiConfigService.authConfig[tokenType];

      const data = this.jwtService.verify<{
        payload?: TPayload | string | null;
      }>(token, {
        secret: tokenConfig.secret,
      });

      if (!data.payload || typeof data.payload === 'string' || typeof data.payload !== 'object') {
        throw new UnauthorizedException('Invalid token payload');
      }

      return { payload: data.payload, token: tokenDoc };
    } catch (error) {
      Logger.error(error);
      throw this.handleJwtError(error);
    }
  }

  public async signAccessToken(payload: JwtPayload) {
    return this.signToken(payload, TokenType.ACCESS);
  }

  public async verifyAccessToken(token: string) {
    const { payload } = await this.verifyToken(token, TokenType.ACCESS);
    return payload;
  }

  public async signRefreshToken(payload: JwtPayload) {
    return this.signToken(payload, TokenType.REFRESH);
  }

  public async verifyRefreshToken(token: string) {
    return await this.verifyToken(token, TokenType.REFRESH);
  }

  public async signConfirmEmailToken(payload: ConfirmEmailPayload) {
    return this.signToken(payload, TokenType.CONFIRM_EMAIL);
  }

  public async verifyConfirmEmailToken(token: string) {
    const { payload, token: tokenDoc } = await this.verifyToken<ConfirmEmailPayload, TokenType.CONFIRM_EMAIL>(
      token,
      TokenType.CONFIRM_EMAIL,
    );

    await this.revokeToken(tokenDoc.toDto());

    return payload;
  }

  public async signPasswordResetToken(payload: PassowrdResetPayload) {
    return this.signToken(payload, TokenType.PASSWORD_RESET);
  }

  public async verifyPasswordResetToken(token: string) {
    const { payload, token: tokenDoc } = await this.verifyToken<PassowrdResetPayload, TokenType.PASSWORD_RESET>(
      token,
      TokenType.PASSWORD_RESET,
    );

    await this.revokeToken(tokenDoc.toDto());

    return payload;
  }
}
