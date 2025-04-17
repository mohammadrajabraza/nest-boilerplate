import { RoleType } from '@/constants/role-type';
import {
  EmailField,
  EnumField,
  PasswordField,
} from '@/decorators/field.decorator';

export class EmailLoginBodyDto {
  @EmailField({ swagger: true })
  email: string;

  @PasswordField({ swagger: true })
  password: string;

  @EnumField(() => RoleType, { swagger: true })
  role: RoleType;
}
