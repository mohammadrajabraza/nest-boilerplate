import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { UseDto } from '@/decorators/use-dto.decorator';
import { AuthAuditLogDto } from '@/modules/auth-audit-logs/domain/auth-audit-log.dto';
import { Uuid } from '@/types';

@Entity({ name: 'auth_audit_logs' })
@UseDto(AuthAuditLogDto)
export class AuthAuditLogEntity {
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
  eventType: string;

  @Column({ nullable: true, type: 'text' })
  deviceInfo: string | null;

  @Column({ nullable: true, type: 'varchar' })
  ipAddress: string | null;

  @Column({ nullable: true, type: 'uuid' })
  userId?: string;

  @Column({ nullable: true, type: 'jsonb' })
  body?: string;

  @Column({ nullable: true, type: 'jsonb' })
  response?: string;

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

  toDto(): AuthAuditLogDto {
    return new AuthAuditLogDto(this);
  }
}
