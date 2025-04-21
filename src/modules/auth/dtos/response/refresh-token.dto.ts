import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { ClassField } from '@/decorators/field.decorator';
import { AuthTokenResponseDto } from '@/modules/token/dtos/auth-token.dto';

export class RefreshResponseDto {
  @ClassField(() => AuthTokenResponseDto)
  tokens: AuthTokenResponseDto;
}

export class RefreshTokenResponseDto extends BaseResponseMixin(
  RefreshResponseDto,
) {}
