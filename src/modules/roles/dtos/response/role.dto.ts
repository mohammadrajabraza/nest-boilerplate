import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { RoleDto } from '../../domain/role.dto';

export class RoleResponseDto extends BaseResponseMixin(RoleDto) {}
