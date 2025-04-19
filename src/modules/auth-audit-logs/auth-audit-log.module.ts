import { Module } from '@nestjs/common';
import { AuthAuditLogService } from './auth-audit-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAuditLogEntity } from './infrastructure/entities/auth-audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthAuditLogEntity])],
  providers: [AuthAuditLogService],
  exports: [AuthAuditLogService],
})
export class AuthAuditLogModule {}
