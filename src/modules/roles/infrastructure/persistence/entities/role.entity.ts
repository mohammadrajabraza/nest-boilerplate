import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { RoleDto } from '@/modules/roles/domain/role.dto';
import { UseDto } from '@/decorators/use-dto.decorator';
import { UserRoleEntity } from './user-role.entity';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';

@Entity({ name: 'roles' })
@UseDto(RoleDto)
export class RoleEntity extends AbstractEntity<RoleDto> {
  @Column({ nullable: false, type: 'varchar', unique: true })
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.role)
  userRoles: UserRoleEntity[];

  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.roleCreators)
  creator: UserEntity | null;

  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.roleUpdators)
  updator: UserEntity | null;

  @JoinColumn({ name: 'deleted_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.roleDeletors)
  deletor: UserEntity | null;
}
