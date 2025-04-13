import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { RoleDto } from '@/modules/roles/dtos/role.dto';
import { UseDto } from '@/decorators/use-dto.decorator';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';

@Entity({ name: 'roles' })
@UseDto(RoleDto)
export class RoleEntity extends AbstractEntity<RoleDto> {
  @Column({ nullable: false, type: 'varchar' })
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];
}
