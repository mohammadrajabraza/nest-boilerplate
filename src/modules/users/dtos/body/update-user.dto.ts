import { RoleType } from '@/constants/role-type';
import {
  EmailFieldOptional,
  EnumFieldOptional,
  PasswordFieldOptional,
  PhoneFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorator';

export class UpdateUserBodyDto {
  @StringFieldOptional({ swagger: true, nullable: true })
  firstName?: string;

  @StringFieldOptional({ swagger: true, nullable: true })
  lastName?: string;

  @EmailFieldOptional({ swagger: true, nullable: true })
  email?: string;

  @PasswordFieldOptional({ swagger: true, nullable: true })
  password?: string;

  @PhoneFieldOptional({ swagger: true, nullable: true })
  phone?: string;

  @EnumFieldOptional(() => RoleType, { swagger: true, nullable: true })
  role?: RoleType;

  @StringFieldOptional({ swagger: true, nullable: true })
  companyId?: string;
}
