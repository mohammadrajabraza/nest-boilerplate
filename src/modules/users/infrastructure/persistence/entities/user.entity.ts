import { Column, Entity, JoinColumn, ManyToOne, VirtualColumn } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { UseDto } from '@/decorators/use-dto.decorator';
import type { UserDtoOptions } from '@/modules/users/dtos/user.dto';
import { UserDto } from '@/modules/users/dtos/user.dto';
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/entities/role.entity';
import { CompanyEntity } from '@/modules/companies/infrastructure/persistence/entities/company.entity';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  @Column({ nullable: true, type: 'varchar' })
  firstName!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  lastName!: string | null;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  password!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  phone!: string | null;

  @VirtualColumn({
    query: (alias) =>
      `SELECT CONCAT(${alias}.first_name, ' ', ${alias}.last_name)`,
  })
  fullName!: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @Column({ nullable: true, type: 'uuid' })
  companyId: string;

  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_role_fkey',
  })
  @ManyToOne(() => RoleEntity, (role) => role.users)
  role: RoleEntity;

  @JoinColumn({
    name: 'company_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_company_fkey',
  })
  @ManyToOne(() => CompanyEntity, (company) => company.users)
  company: CompanyEntity;
}
