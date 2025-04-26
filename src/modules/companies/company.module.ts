import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { UserModule } from '../users/user.module';
import { UserService } from '../users/user.service';
import { RoleModule } from '../roles/role.module';
import entities from '@/database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    forwardRef(() => UserModule),
    forwardRef(() => RoleModule),
  ],
  controllers: [CompanyController],
  providers: [CompanyService, UserService],
  exports: [CompanyService],
})
export class CompanyModule {}
