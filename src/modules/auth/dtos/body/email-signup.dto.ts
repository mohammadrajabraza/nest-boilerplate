import { RoleType } from '@/constants/role-type';
import {
  EmailField,
  EnumField,
  PasswordField,
  PhoneFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorator';

export class EmailSignupBodyDto {
  @StringField({ swagger: true })
  firstName: string;

  @StringField({ swagger: true })
  lastName: string;

  @EmailField({ swagger: true })
  email: string;

  @PasswordField({ swagger: true })
  password: string;

  @PhoneFieldOptional({ swagger: true })
  phone?: string | null;

  @EnumField(() => RoleType)
  role: RoleType;

  @StringFieldOptional({ swagger: true })
  companyId?: string | null;
}
