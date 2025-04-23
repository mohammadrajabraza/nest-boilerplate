import { StringFieldOptional } from '@/decorators/field.decorator';

export class UpdateRoleBodyDto {
  @StringFieldOptional({ swagger: true })
  name?: string;

  @StringFieldOptional({ swagger: true })
  description?: string;
}
