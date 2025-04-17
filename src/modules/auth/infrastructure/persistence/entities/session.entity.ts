import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';

@Entity({ name: 'sessions' })
export class SessionEntity extends AbstractEntity {
  @Column({ nullable: false, type: 'text' })
  accessToken: string;

  @Column({ nullable: true, type: 'text' })
  refreshToken!: string | null;

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
  loginAt: Date | string | null;

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
