import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { CompanyDto } from '../../domain/company.dto';

export class CompanyResponseDto extends BaseResponseMixin(CompanyDto) {}
