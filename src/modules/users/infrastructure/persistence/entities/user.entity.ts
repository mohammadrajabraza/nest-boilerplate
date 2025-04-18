import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  VirtualColumn,
} from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { UseDto } from '@/decorators/use-dto.decorator';
import type { UserDtoOptions } from '@/modules/users/dtos/user.dto';
import { UserDto } from '@/modules/users/dtos/user.dto';
import { CompanyEntity } from '@/modules/companies/infrastructure/persistence/entities/company.entity';
import { UserRoleEntity } from '@/modules/roles/infrastructure/persistence/entities/user-role.entity';
import { ProfileSettingEntity } from './profile-setting.entity';
import { SessionEntity } from '@/modules/auth/infrastructure/persistence/entities/session.entity';
import { AuthAuditLogEntity } from '@/modules/auth/infrastructure/persistence/entities/auth-audit-log.entity';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  @Column({ nullable: true, type: 'varchar' })
  firstName!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  lastName!: string | null;

  @Column({ unique: true, nullable: false, type: 'varchar' })
  email!: string;

  @Column({ nullable: false, type: 'varchar' })
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  phone!: string | null;

  @VirtualColumn({
    query: (alias) =>
      `SELECT CONCAT(${alias}.first_name, ' ', ${alias}.last_name)`,
  })
  fullName!: string;

  @Column({ nullable: true, type: 'uuid' })
  companyId: string;

  @JoinColumn({
    name: 'company_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_company_fkey',
  })
  @ManyToOne(() => CompanyEntity, (company) => company.users)
  company: CompanyEntity;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles: UserRoleEntity[];

  @OneToOne(() => ProfileSettingEntity, (profileSetting) => profileSetting.user)
  profileSetting: ProfileSettingEntity;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[];

  @OneToMany(() => AuthAuditLogEntity, (authAuditLog) => authAuditLog.user)
  authAuditLogs: AuthAuditLogEntity[];
}
