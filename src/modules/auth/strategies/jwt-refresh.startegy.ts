import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { StrategyName } from '@/constants/strategy-name';
import { JwtPayload, RefreshPayload } from '@/types/jwt';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { UserService } from '@/modules/users/user.service';
import { AuthService } from '../auth.service';
import { TokenType } from '@/constants/token-type';
import errorMessage from '@/constants/error-message';
import { TokenService } from '@/modules/token/token.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy<typeof Strategy, RefreshPayload>(
  Strategy,
  StrategyName.JWT_REFRESH,
) {
  constructor(
    private apiConfigService: ApiConfigService,
    private userService: UserService,
    private authService: AuthService,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.headers['x-refresh-token'] as string) || null,
      ]),
      secretOrKey: apiConfigService.authConfig.refresh.secret,
      algorithms: [apiConfigService.authConfig.algorithm],
      passReqToCallback: true,
    });
  }

  async validate(req: Request, { payload }: { payload: JwtPayload }) {
    const token = req.headers['x-refresh-token'];

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException(errorMessage.TOKEN.REFRESH_NOT_FOUND);
    }

    if (payload.type !== TokenType.REFRESH) {
      throw new UnauthorizedException(errorMessage.TOKEN.INVALID_TYPE);
    }

    const tokenDoc = await this.tokenService.getToken(token, TokenType.REFRESH);

    const user = await this.userService.findOne({
      id: payload.userId,
      role: payload.role,
    });

    const session = await this.authService.checkSession({
      userId: user.id,
      refreshToken: token,
    });

    return {
      user: user.toDto({ role: payload.role }),
      session: session.toDto(),
      token: tokenDoc.toDto(),
    };
  }
}
