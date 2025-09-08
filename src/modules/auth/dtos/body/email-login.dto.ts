import { RoleType } from '@/constants/role-type';
import { EmailField, EnumField, PasswordField, StringFieldOptional } from '@/decorators/field.decorator';

export class EmailLoginBodyDto {
  @EmailField({ swagger: true })
  email: string;

  @PasswordField({ swagger: true })
  password: string;

  @EnumField(() => RoleType, { swagger: true })
  role: RoleType;

  @StringFieldOptional({ swagger: true, nullable: true })
  deviceToken?: string;

  @StringFieldOptional({ swagger: true, nullable: true })
  timeZone?: string;
}
