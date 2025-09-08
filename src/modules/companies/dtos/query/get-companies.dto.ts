import { PageOptionsDto } from '@/common/dto/page-options.dto';
import { CompanySort } from '@/constants/sort';
import { BooleanFieldOptional, EnumFieldOptional } from '@/decorators/field.decorator';
export class GetCompaniesQueryDto extends PageOptionsDto {
  @EnumFieldOptional(() => CompanySort, {
    default: CompanySort.CREATED_AT,
  })
  sort: CompanySort;

  @BooleanFieldOptional({ swagger: true, default: false })
  user?: boolean;
}
