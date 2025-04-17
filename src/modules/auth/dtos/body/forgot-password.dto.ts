import { EmailField } from '@/decorators/field.decorator';

export class ForgotPasswordBodyDto {
  @EmailField({ swagger: true })
  email: string;
}
