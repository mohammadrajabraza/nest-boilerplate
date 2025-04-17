import { StringField } from '@/decorators/field.decorator';

export class EmailVerifyQueryDto {
  @StringField({ swagger: true })
  token: string;
}
