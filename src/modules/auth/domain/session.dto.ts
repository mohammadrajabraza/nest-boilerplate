import { AbstractDto } from '@/common/dto/abstract.dto';
import {
  BooleanField,
  DateField,
  DateFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorator';
import type { SessionEntity } from '../infrastructure/persistence/entities/session.entity';

export class SessionDto extends AbstractDto {
  @StringFieldOptional({ nullable: false })
  accessToken: string;

  @StringFieldOptional({ nullable: false })
  refreshToken: string;

  @StringFieldOptional({ nullable: true })
  deviceToken: string | null;

  @StringFieldOptional({ nullable: true })
  timeZone: string | null;

  @StringFieldOptional({ nullable: false })
  userId: string;

  @DateField({ swagger: true })
  loginAt: Date;

  @DateFieldOptional({ swagger: true })
  logoutAt: Date | null;

  @BooleanField({ swagger: true })
  isLoggedIn: boolean;

  constructor(session: SessionEntity) {
    super(session);

    this.accessToken = session.accessToken;
    this.refreshToken = session.refreshToken;
    this.deviceToken = session.deviceToken;
    this.timeZone = session.timeZone;
    this.loginAt = new Date(session.loginAt);
    this.logoutAt = session.logoutAt ? new Date(session.logoutAt) : null;
    this.isLoggedIn = session.isLoggedIn;
    this.userId = session.userId;
  }
}
