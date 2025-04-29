import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UseDto } from '@/decorators/use-dto.decorator';
import { TokenDto } from '@/modules/token/domain/token.dto';
import { TokenType } from '@/constants/token-type';

@Entity({ name: 'tokens' })
@UseDto(TokenDto)
export class TokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: Uuid;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP', // Initial default for updates
    onUpdate: 'CURRENT_TIMESTAMP', // Update to current timestamp
  })
  updatedAt!: Date;

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

  toDto(): TokenDto {
    return new TokenDto(this);
  }
}
