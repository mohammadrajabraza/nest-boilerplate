import { PasswordField } from '@/decorators/field.decorator';

export class ChangePasswordBodyDto {
  @PasswordField({ swagger: true })
  password: string;

  @PasswordField({ swagger: true, match: 'password' })
  confirmPassword: string;
}
