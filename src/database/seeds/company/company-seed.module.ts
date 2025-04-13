import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanySeedService } from './company-seed.service';
import { CompanyEntity } from '@/modules/companies/infrastructure/persistence/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  providers: [CompanySeedService],
  exports: [CompanySeedService],
})
export class CompanySeedModule {}
