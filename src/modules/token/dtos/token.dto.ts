import { AbstractDto } from '@/common/dto/abstract.dto';
import {
  BooleanField,
  DateField,
  EnumField,
  StringField,
} from '@/decorators/field.decorator';
import type { TokenEntity } from '../infrastructure/persistence/entities/token.entity';
import { TokenType } from '@/constants/token-type';

export class TokenDto extends AbstractDto {
  @StringField()
  token: string;

  @EnumField(() => TokenType)
  @StringField()
  tokenType: TokenType;

  @DateField()
  issuedAt: Date;

  @DateField()
  expiresAt: Date;

  @BooleanField()
  isRevoked: boolean;

  constructor(token: TokenEntity) {
    super(token);

    const tokenType = [
      TokenType.ACCESS,
      TokenType.REFRESH,
      TokenType.CONFIRM_EMAIL,
      TokenType.PASSWORD_RESET,
    ].find((type) => token.tokenType === type);

    if (!tokenType) {
      throw new Error('Invalid token type');
    }

    this.token = token.token;
    this.tokenType = tokenType;
    this.issuedAt = new Date(token.issuedAt);
    this.expiresAt = new Date(token.expiresAt);
    this.isRevoked = token.isRevoked;
  }
}
