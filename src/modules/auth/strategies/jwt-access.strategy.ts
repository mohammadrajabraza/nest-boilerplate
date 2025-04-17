import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import type { RoleType } from '@/constants/role-type';
import { TokenType } from '@/constants/token-type';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { UserService } from '@/modules/users/user.service';
import { StrategyName } from '@/constants/strategy-name';
import type { Request } from 'express';
import type { Uuid } from '@/types';
import errorMessage from '@/constants/error-message';
import { UserDto } from '@/modules/users/dtos/user.dto';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy<
  typeof Strategy,
  UserDto
>(Strategy, StrategyName.JWT_ACCESS) {
  constructor(
    configService: ApiConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authConfig.access.secret,
      algorithms: [configService.authConfig.algorithm],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(
    req: Request,
    payload: { userId: Uuid; role: RoleType; type: TokenType },
  ): Promise<UserDto> {
    console.log('JwtAccessStrategy: Request headers =', req.headers);
    console.log('JwtAccessStrategy: Payload =', payload);

    // Validate token type
    if (payload.type !== TokenType.ACCESS) {
      console.warn('JwtAccessStrategy: Invalid token type =', payload.type);
      throw new UnauthorizedException(errorMessage.TOKEN.INVALID_TYPE);
    }

    // Verify user exists
    const user = await this.userService.findOne({
      id: payload.userId,
      role: payload.role,
    });
    return user.toDto({ role: payload.role });
  }
}
