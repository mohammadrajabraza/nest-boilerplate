import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, VirtualColumn } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { UseDto } from '@/decorators/use-dto.decorator';
import type { UserDtoOptions } from '@/modules/users/domain/user.dto';
import { UserDto } from '@/modules/users/domain/user.dto';
import { CompanyEntity } from '@/modules/companies/infrastructure/persistence/entities/company.entity';
import { UserRoleEntity } from '@/modules/roles/infrastructure/persistence/entities/user-role.entity';
import { ProfileSettingEntity } from './profile-setting.entity';
import { SessionEntity } from '@/modules/auth/infrastructure/persistence/entities/session.entity';
import { AuthAuditLogEntity } from '@/modules/auth-audit-logs/infrastructure/entities/auth-audit-log.entity';
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/entities/role.entity';

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
  phone?: string | null;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
    default: () => "'{email}'",
  })
  authProviders: string[];

  @Column({ type: 'text', nullable: true })
  googleId?: string;

  @Column({ type: 'text', nullable: true })
  profilePicture: string;

  @VirtualColumn({
    query: (alias) => `SELECT CONCAT(${alias}.first_name, ' ', ${alias}.last_name)`,
  })
  fullName!: string;

  @Column({ nullable: true, type: 'uuid' })
  companyId: string | null;

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

  // Column ref of created_by, updated_by, deleted_by
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.userCreators)
  creator: UserEntity | null;

  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.userUpdators)
  updator: UserEntity | null;

  @JoinColumn({ name: 'deleted_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.userDeletors)
  deletor: UserEntity | null;

  // User creators, updators, deletors
  @OneToMany(() => UserEntity, (user) => user.creator)
  userCreators: UserEntity[];

  @OneToMany(() => UserEntity, (user) => user.updator)
  userUpdators: UserEntity[];

  @OneToMany(() => UserEntity, (user) => user.deletor)
  userDeletors: UserEntity[];

  // Company creators, updators, deletors
  @OneToMany(() => CompanyEntity, (company) => company.creator)
  companyCreators: CompanyEntity[];

  @OneToMany(() => CompanyEntity, (company) => company.updator)
  companyUpdators: CompanyEntity[];

  @OneToMany(() => CompanyEntity, (company) => company.deletor)
  companyDeletors: CompanyEntity[];

  // Role creators, updators, deletors
  @OneToMany(() => RoleEntity, (role) => role.creator)
  roleCreators: RoleEntity[];

  @OneToMany(() => RoleEntity, (role) => role.updator)
  roleUpdators: RoleEntity[];

  @OneToMany(() => RoleEntity, (role) => role.deletor)
  roleDeletors: RoleEntity[];

  // User Role creators, updators, deletors
  @OneToMany(() => UserRoleEntity, (userRole) => userRole.creator)
  userRoleCreators: UserRoleEntity[];

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.updator)
  userRoleUpdators: UserRoleEntity[];

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.deletor)
  userRoleDeletors: UserRoleEntity[];

  // Session creators, updators, deletors
  @OneToMany(() => SessionEntity, (session) => session.creator)
  sessionCreators: SessionEntity[];

  @OneToMany(() => SessionEntity, (session) => session.updator)
  sessionUpdators: SessionEntity[];

  @OneToMany(() => SessionEntity, (session) => session.deletor)
  sessionDeletors: SessionEntity[];

  // Profile Setting creator, updator, deletor
  @OneToMany(() => ProfileSettingEntity, (profileSetting) => profileSetting.creator)
  profileSettingCreators: ProfileSettingEntity[];

  @OneToMany(() => ProfileSettingEntity, (profileSetting) => profileSetting.updator)
  profileSettingUpdators: ProfileSettingEntity[];

  @OneToMany(() => ProfileSettingEntity, (profileSetting) => profileSetting.deletor)
  profileSettingDeletors: ProfileSettingEntity[];
}
