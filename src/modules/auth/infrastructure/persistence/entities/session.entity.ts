import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { UseDto } from '@/decorators/use-dto.decorator';
import { SessionDto } from '@/modules/auth/domain/session.dto';

@Entity({ name: 'sessions' })
@UseDto(SessionDto)
export class SessionEntity extends AbstractEntity<SessionDto> {
  @Column({ nullable: false, type: 'text' })
  accessToken: string;

  @Column({ nullable: false, type: 'text' })
  refreshToken: string;

  @Column({ nullable: true, type: 'text' })
  deviceToken: string | null;

  @Column({ nullable: true, type: 'varchar' })
  timeZone: string | null;

  @Column({ nullable: false, type: 'uuid' })
  userId: string;

  @Column({
    nullable: true,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  loginAt: Date | string;

  @Column({
    nullable: true,
    type: 'timestamptz',
  })
  logoutAt: Date | string | null;

  @Column({
    nullable: false,
    default: false,
    type: 'boolean',
  })
  isLoggedIn: boolean;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_session_fkey',
  })
  @ManyToOne(() => UserEntity, (user) => user.sessions)
  user: UserEntity;
}
