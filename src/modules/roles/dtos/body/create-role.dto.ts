import { StringField, StringFieldOptional } from '@/decorators/field.decorator';

export class CreateRoleBodyDto {
  @StringField({ swagger: true })
  name: string;

  @StringFieldOptional({ swagger: true })
  description: string;
}
