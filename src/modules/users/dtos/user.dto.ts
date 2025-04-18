import { AbstractDto } from '@/common/dto/abstract.dto';
import {
  EmailFieldOptional,
  EnumFieldOptional,
  PhoneFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorator';
import type { UserEntity } from '../infrastructure/persistence/entities/user.entity';
import { RoleType } from '@/constants/role-type';
import { isRole } from '@/utils/is-role';

export type UserDtoOptions = Partial<{ role: RoleType }>;

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: true })
  firstName?: string | null;

  @StringFieldOptional({ nullable: true })
  lastName?: string | null;

  @EmailFieldOptional({ nullable: true })
  email?: string | null;

  @PhoneFieldOptional({ nullable: true })
  phone?: string | null;

  @EnumFieldOptional(() => RoleType, { nullable: true })
  role: RoleType;

  constructor(user: UserEntity, options?: UserDtoOptions) {
    super(user);
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.phone = user.phone;

    if (user.userRoles && user.userRoles.length > 0) {
      const role =
        user.userRoles.find(
          (userRole) => userRole.role.name === options?.role,
        ) ?? null;
      this.role = isRole(role?.role.name || null);
    } else {
      throw new Error('Invalid role');
    }
  }
}
