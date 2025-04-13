import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSeedService } from './user-seed.service';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/entities/role.entity';
import { CompanyEntity } from '@/modules/companies/infrastructure/persistence/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, CompanyEntity])],
  providers: [UserSeedService],
  exports: [UserSeedService],
})
export class UserSeedModule {}
