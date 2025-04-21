import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { RoleDto } from '../../domain/role.dto';

export class ListRoleResponseDto extends BaseResponseMixin(RoleDto, {
  array: true,
}) {}
