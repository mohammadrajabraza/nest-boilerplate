import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSeedService } from './user-seed.service';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/entities/role.entity';
import { CompanyEntity } from '@/modules/companies/infrastructure/persistence/entities/company.entity';
import { UserRoleEntity } from '@/modules/roles/infrastructure/persistence/entities/user-role.entity';
import { ProfileSettingEntity } from '@/modules/users/infrastructure/persistence/entities/profile-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      CompanyEntity,
      UserRoleEntity,
      ProfileSettingEntity,
    ]),
  ],
  providers: [UserSeedService],
  exports: [UserSeedService],
})
export class UserSeedModule {}
