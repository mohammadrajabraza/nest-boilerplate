import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { RoleDto } from '@/modules/roles/domain/role.dto';
import { UseDto } from '@/decorators/use-dto.decorator';
import { UserRoleEntity } from './user-role.entity';

@Entity({ name: 'roles' })
@UseDto(RoleDto)
export class RoleEntity extends AbstractEntity<RoleDto> {
  @Column({ nullable: false, type: 'varchar' })
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.role)
  userRoles: UserRoleEntity[];
}
