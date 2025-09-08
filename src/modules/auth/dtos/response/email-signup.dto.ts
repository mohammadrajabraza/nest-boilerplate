import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { UserDto } from '@/modules/users/domain/user.dto';

export class SignupResponseDto extends UserDto {}

export class EmailSignupResponseDto extends BaseResponseMixin(SignupResponseDto) {}
