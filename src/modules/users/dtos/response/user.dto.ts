import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { UserDto } from '../../domain/user.dto';

export class UserResponseDto extends BaseResponseMixin(UserDto) {}
