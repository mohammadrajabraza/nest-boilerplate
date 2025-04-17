import { BaseResponseMixin } from '@/common/dto/base-response.dto';

class ResendResponseDto {}

export class EmailResendResponseDto extends BaseResponseMixin(
  ResendResponseDto,
) {}
