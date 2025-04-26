import { PageOptionsDto } from '@/common/dto/page-options.dto';
import { RoleType } from '@/constants/role-type';
import { EnumFieldOptional } from '@/decorators/field.decorator';

export class GetUsersQueryDto extends PageOptionsDto {
  @EnumFieldOptional(() => RoleType, {
    nullable: true,
  })
  readonly role!: RoleType | null;
}
