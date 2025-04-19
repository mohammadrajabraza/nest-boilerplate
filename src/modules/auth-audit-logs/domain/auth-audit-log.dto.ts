import { AbstractDto } from '@/common/dto/abstract.dto';
import {
  DateField,
  EnumFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorator';
import { AuthAuditLogEvent } from '@/constants/auth-audit-log-event';
import { AuthAuditLogEntity } from '../infrastructure/entities/auth-audit-log.entity';

export class AuthAuditLogDto extends AbstractDto {
  @EnumFieldOptional(() => AuthAuditLogEvent, { nullable: false })
  eventType: string;

  @StringFieldOptional({ nullable: true })
  deviceInfo: string | null;

  @StringFieldOptional({ nullable: true })
  ipAddress: string | null;

  @StringFieldOptional({ nullable: true })
  userId?: string;

  @StringFieldOptional({ nullable: true })
  body?: string;

  @StringFieldOptional({ nullable: true })
  response?: string;

  @DateField({ swagger: true })
  eventTimestamp: Date;

  constructor(authAuditLog: AuthAuditLogEntity) {
    super(authAuditLog);

    this.eventType = authAuditLog.eventType as AuthAuditLogEvent;
    this.userId = authAuditLog.userId;
    this.deviceInfo = authAuditLog.deviceInfo;
    this.ipAddress = authAuditLog.ipAddress;
    this.eventTimestamp = new Date(authAuditLog.eventTimestamp);
  }
}
