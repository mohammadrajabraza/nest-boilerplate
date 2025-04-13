import { AbstractDto } from '@/common/dto/abstract.dto';
import {
  BooleanFieldOptional,
  EmailFieldOptional,
  PhoneFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorator';
import type { UserEntity } from '../infrastructure/persistence/entities/user.entity';

export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: true })
  firstName?: string | null;

  @StringFieldOptional({ nullable: true })
  lastName?: string | null;

  @EmailFieldOptional({ nullable: true })
  email?: string | null;

  @PhoneFieldOptional({ nullable: true })
  phone?: string | null;

  @BooleanFieldOptional()
  isActive?: boolean;

  constructor(user: UserEntity, options?: UserDtoOptions) {
    super(user);
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.phone = user.phone;
    this.isActive = options?.isActive;
  }
}
