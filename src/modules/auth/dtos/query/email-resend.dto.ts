import { StringField } from '@/decorators/field.decorator';

export class EmailResendQueryDto {
  @StringField({ swagger: true })
  email: string;
}
