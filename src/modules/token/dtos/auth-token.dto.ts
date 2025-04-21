import {
  ClassField,
  DateField,
  StringField,
} from '@/decorators/field.decorator';

export class TokenPayload {
  @StringField({ swagger: true })
  token: string;

  @DateField({ swagger: true })
  expiresIn: Date;
}

export class AuthTokenResponseDto {
  @ClassField(() => TokenPayload)
  access: TokenPayload;

  @ClassField(() => TokenPayload)
  refresh: TokenPayload;
}
