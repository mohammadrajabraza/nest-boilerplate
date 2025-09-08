import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { TokenType } from '@/constants/token-type';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { UserService } from '@/modules/users/user.service';
import { StrategyName } from '@/constants/strategy-name';
import type { Request } from 'express';
import errorMessage from '@/constants/error-message';
import { AuthService } from '../auth.service';
import { AccessPayload, JwtPayload } from '@/types/jwt';
import { TokenService } from '@/modules/token/token.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy<typeof Strategy, AccessPayload>(
  Strategy,
  StrategyName.JWT_ACCESS,
) {
  constructor(
    private apiConfigService: ApiConfigService,
    private userService: UserService,
    private authService: AuthService,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: apiConfigService.authConfig.access.secret,
      algorithms: [apiConfigService.authConfig.algorithm],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, { payload }: { payload: JwtPayload }): Promise<AccessPayload> {
    const token = req.headers.authorization?.replace('Bearer ', '').trim();

    if (!token) {
      throw new UnauthorizedException(errorMessage.TOKEN.NOT_FOUND);
    }

    // Validate token type
    if (payload.type !== TokenType.ACCESS) {
      throw new UnauthorizedException(errorMessage.TOKEN.INVALID_TYPE);
    }

    const tokenDoc = await this.tokenService.getToken(token, TokenType.ACCESS);

    // Verify user exists
    const user = await this.userService.findOne({
      id: payload.userId,
      role: payload.role,
    });

    const session = await this.authService.checkSession({
      accessToken: token,
      userId: user.id,
    });

    return {
      user: user.toDto({ role: payload.role }),
      session: session.toDto(),
      token: tokenDoc.toDto(),
    };
  }
}
