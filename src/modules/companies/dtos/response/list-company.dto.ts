import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { CompanyDto } from '../../domain/company.dto';

export class ListCompanyResponseDto extends BaseResponseMixin(CompanyDto, {
  array: true,
}) {}
