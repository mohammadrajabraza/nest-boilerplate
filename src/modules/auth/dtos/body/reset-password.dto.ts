import { PasswordField } from '@/decorators/field.decorator';

export class ResetPasswordBodyDto {
  @PasswordField({ swagger: true })
  password: string;
}
