import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { ClassField } from '@/decorators/field.decorator';
import { AuthTokenResponseDto } from '@/modules/roles/dtos/response/auth-token.dto';
import { UserDto } from '@/modules/users/dtos/user.dto';

export class LoginResponseDto {
  @ClassField(() => UserDto)
  user: UserDto;

  @ClassField(() => AuthTokenResponseDto)
  tokens: AuthTokenResponseDto;
}

export class EmailLoginResponseDto extends BaseResponseMixin(
  LoginResponseDto,
) {}
