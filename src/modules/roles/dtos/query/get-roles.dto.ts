import { PageOptionsDto } from '@/common/dto/page-options.dto';
import { RoleSort } from '@/constants/sort';
import { EnumFieldOptional } from '@/decorators/field.decorator';

export class GetRolesQueryDto extends PageOptionsDto {
  @EnumFieldOptional(() => RoleSort, {
    default: RoleSort.CREATED_AT,
  })
  sort: RoleSort;
}
