import { BooleanFieldOptional } from '@/decorators/field.decorator';

export class GetCompanyByIdQueryDto {
  @BooleanFieldOptional({ swagger: true, default: false })
  user?: boolean;
}
