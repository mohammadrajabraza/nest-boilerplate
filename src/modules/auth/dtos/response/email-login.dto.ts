import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { BooleanField, ClassField } from '@/decorators/field.decorator';
import { AuthTokenResponseDto } from '@/modules/token/dtos/auth-token.dto';
import { UserDto } from '@/modules/users/domain/user.dto';

export class LoginResponseDto {
  @ClassField(() => UserDto)
  user: UserDto;

  @ClassField(() => AuthTokenResponseDto)
  tokens: AuthTokenResponseDto;

  @BooleanField()
  isPasswordReset: boolean;
}

export class EmailLoginResponseDto extends BaseResponseMixin(
  LoginResponseDto,
) {}
