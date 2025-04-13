import { AbstractDto } from '@/common/dto/abstract.dto';
import { RoleType } from '@/constants/role-type';
import {
  EnumFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorator';
import type { RoleEntity } from '../infrastructure/persistence/entities/role.entity';

export class RoleDto extends AbstractDto {
  @EnumFieldOptional(() => RoleType)
  @StringFieldOptional({ nullable: false })
  name: string;

  @StringFieldOptional({ nullable: true })
  description?: string | null;

  constructor(role: RoleEntity) {
    super(role);
    this.name = role.name;
    this.description = role.description;
  }
}
