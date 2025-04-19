import { RoleType } from '@/constants/role-type';
import {
  EmailField,
  EnumField,
  PasswordField,
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

  @StringFieldOptional({ swagger: true })
  phone?: string | null;

  @EnumField(() => RoleType)
  role: RoleType;

  @StringFieldOptional({ swagger: true })
  companyId?: string | null;
}
