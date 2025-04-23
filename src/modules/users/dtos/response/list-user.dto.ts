import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { UserDto } from '../../domain/user.dto';

export class ListUserResponseDto extends BaseResponseMixin(UserDto, {
  array: true,
}) {}
