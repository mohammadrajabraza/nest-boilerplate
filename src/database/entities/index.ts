import { AuthAuditLogEntity } from '@/modules/auth-audit-logs/infrastructure/entities/auth-audit-log.entity';
import { SessionEntity } from '@/modules/auth/infrastructure/persistence/entities/session.entity';
import { CompanyEntity } from '@/modules/companies/infrastructure/persistence/entities/company.entity';
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/entities/role.entity';
import { UserRoleEntity } from '@/modules/roles/infrastructure/persistence/entities/user-role.entity';
import { TokenEntity } from '@/modules/token/infrastructure/persistence/entities/token.entity';
import { ProfileSettingEntity } from '@/modules/users/infrastructure/persistence/entities/profile-setting.entity';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';

export default [
  CompanyEntity,
  UserEntity,
  UserRoleEntity,
  ProfileSettingEntity,
  RoleEntity,
  SessionEntity,
  AuthAuditLogEntity,
  TokenEntity,
];
