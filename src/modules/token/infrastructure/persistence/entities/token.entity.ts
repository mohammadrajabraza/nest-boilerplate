import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { UseDto } from '@/decorators/use-dto.decorator';
import { TokenDto } from '@/modules/token/dtos/token.dto';
import { TokenType } from '@/constants/token-type';

@Entity({ name: 'tokens' })
@UseDto(TokenDto)
export class TokenEntity extends AbstractEntity<TokenDto> {
  @Column({ nullable: false, type: 'text' })
  token: string;

  @Column({ type: 'varchar', nullable: false, default: TokenType.ACCESS })
  tokenType: string;

  @Column({
    nullable: false,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  issuedAt: Date | string;

  @Column({ nullable: false, type: 'timestamptz' })
  expiresAt: Date | string;

  @Column({ nullable: false, type: 'boolean', default: false })
  isRevoked: boolean;
}
