import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { UserDto } from '@/modules/users/dtos/user.dto';

class ResponseDto extends UserDto {}

export class GetMeResponseDto extends BaseResponseMixin(ResponseDto) {}
