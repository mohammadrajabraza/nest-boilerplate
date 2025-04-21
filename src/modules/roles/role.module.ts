import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './infrastructure/persistence/entities/role.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { UserRoleEntity } from './infrastructure/persistence/entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, UserRoleEntity])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
