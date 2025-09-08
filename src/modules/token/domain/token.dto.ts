import { BooleanField, DateField, EnumField, StringField, UUIDField } from '@/decorators/field.decorator';
import type { TokenEntity } from '../infrastructure/persistence/entities/token.entity';
import { TokenType } from '@/constants/token-type';

export class TokenDto {
  @UUIDField()
  id!: Uuid;

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;

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
    const tokenType = [TokenType.ACCESS, TokenType.REFRESH, TokenType.CONFIRM_EMAIL, TokenType.PASSWORD_RESET].find(
      (type) => token.tokenType === type,
    );

    if (!tokenType) {
      throw new Error('Invalid token type');
    }

    this.id = token.id;
    this.createdAt = token.createdAt;
    this.updatedAt = token.updatedAt;
    this.token = token.token;
    this.tokenType = tokenType;
    this.issuedAt = new Date(token.issuedAt);
    this.expiresAt = new Date(token.expiresAt);
    this.isRevoked = token.isRevoked;
  }
}
