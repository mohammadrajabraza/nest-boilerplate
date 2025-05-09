import { RoleType } from '@/constants/role-type';
import {
  EmailField,
  EnumField,
  PhoneFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorator';

export class CreateUserBodyDto {
  @StringField({ swagger: true })
  firstName: string;

  @StringField({ swagger: true })
  lastName: string;

  @EmailField({ swagger: true })
  email: string;

  @PhoneFieldOptional({ swagger: true })
  phone?: string | null;

  @EnumField(() => RoleType)
  role: RoleType;

  @StringFieldOptional({ swagger: true })
  companyId?: string | null;
}
