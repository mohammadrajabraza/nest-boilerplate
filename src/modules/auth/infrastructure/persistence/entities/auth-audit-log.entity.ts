import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { UseDto } from '@/decorators/use-dto.decorator';
import { AuthAuditLogDto } from '@/modules/auth/domain/auth-audit-log.dto';

@Entity({ name: 'auth_audit_logs' })
@UseDto(AuthAuditLogDto)
export class AuthAuditLogEntity extends AbstractEntity<AuthAuditLogDto> {
  @Column({ nullable: false, type: 'text' })
  eventType: string;

  @Column({ nullable: true, type: 'text' })
  deviceInfo: string | null;

  @Column({ nullable: true, type: 'varchar' })
  ipAddress: string | null;

  @Column({ nullable: false, type: 'uuid' })
  userId: string;

  @Column({
    nullable: true,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  eventTimestamp: Date | string;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_auth_audit_log_fkey',
  })
  @ManyToOne(() => UserEntity, (user) => user.sessions)
  user: UserEntity;
}
