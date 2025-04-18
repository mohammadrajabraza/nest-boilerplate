import { RoleType } from '@/constants/role-type';
import {
  EmailField,
  EnumField,
  PasswordField,
  StringFieldOptional,
} from '@/decorators/field.decorator';

export class EmailLoginBodyDto {
  @EmailField({ swagger: true })
  email: string;

  @PasswordField({ swagger: true })
  password: string;

  @EnumField(() => RoleType, { swagger: true })
  role: RoleType;

  @StringFieldOptional({ swagger: true })
  deviceToken: string | null;

  @StringFieldOptional({ swagger: true })
  timeZone: string | null;
}
