import { StringFieldOptional } from '@/decorators/field.decorator';

export class UpdateCompanyBodyDto {
  @StringFieldOptional({ swagger: true })
  public name?: string;

  @StringFieldOptional({ swagger: true })
  public ntn?: string;

  @StringFieldOptional({ swagger: true })
  public email?: string;

  @StringFieldOptional({ swagger: true })
  public phone?: string;

  @StringFieldOptional({ swagger: true })
  public address?: string;

  @StringFieldOptional({ swagger: true })
  public industry?: string;

  @StringFieldOptional({ swagger: true })
  public status?: string;
}
