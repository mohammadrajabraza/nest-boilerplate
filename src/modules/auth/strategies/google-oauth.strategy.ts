import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { StrategyName } from '@/constants/strategy-name';
import { SocialUser } from '@/types/jwt';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(
  Strategy,
  StrategyName.GOOGLE_OAUTH,
) {
  constructor(apiConfigService: ApiConfigService) {
    super({
      ...apiConfigService.googleConfig,
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): any {
    const { id, name, emails, photos } = profile;
    const user = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
    } as SocialUser<'google'>;
    done(null, user);
  }
}
