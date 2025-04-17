import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { RoleEntity } from './role.entity';

@Entity({ name: 'user_roles' })
export class UserRoleEntity extends AbstractEntity {
  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @Column({ nullable: true, type: 'uuid' })
  userId: string;

  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_roles_role_fkey',
  })
  @ManyToOne(() => RoleEntity, (role) => role.userRoles)
  role: RoleEntity;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_roles_user_fkey',
  })
  @ManyToOne(() => UserEntity, (user) => user.userRoles)
  user: UserEntity;
}
