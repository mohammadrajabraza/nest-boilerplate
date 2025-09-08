import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthAuditLogEntity } from './infrastructure/entities/auth-audit-log.entity';
import { Repository } from 'typeorm';
import errorMessage from '@/constants/error-message';
import { plainToInstance } from 'class-transformer';
import { AuthAuditLogEvent } from '@/constants/auth-audit-log-event';

@Injectable()
export class AuthAuditLogService {
  constructor(
    @InjectRepository(AuthAuditLogEntity)
    private authAuditLogRepository: Repository<AuthAuditLogEntity>,
  ) {}

  async createAuthAuditLog(data: {
    eventType: AuthAuditLogEvent;
    ipAddress: string;
    deviceInfo?: string;
    userId?: Uuid;
    body?: string;
    response?: string;
  }) {
    try {
      await this.authAuditLogRepository.save(
        plainToInstance(AuthAuditLogEntity, {
          eventType: data.eventType,
          ipAddress: data.ipAddress,
          deviceInfo: data.deviceInfo,
          eventTimestamp: new Date(),
          userId: data.userId,
          body: data.body,
          response: data.response,
        }),
      );
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.AUTH_AUDIT_LOG.CREATION_FAILED);
    }
  }
}
