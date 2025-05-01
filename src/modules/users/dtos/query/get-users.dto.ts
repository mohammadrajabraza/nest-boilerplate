import { PageOptionsDto } from '@/common/dto/page-options.dto';
import { RoleType } from '@/constants/role-type';
import { UserSort } from '@/constants/sort';
import { EnumFieldOptional } from '@/decorators/field.decorator';

export class GetUsersQueryDto extends PageOptionsDto {
  @EnumFieldOptional(() => RoleType, {
    nullable: true,
  })
  readonly role!: RoleType | null;

  @EnumFieldOptional(() => UserSort, {
    default: UserSort.CREATED_AT,
  })
  sort: UserSort;
}
