import { StringField } from '@/decorators/field.decorator';

export class ResetPasswordQueryDto {
  @StringField({ swagger: true })
  token: string;
}
