import { StringFieldOptional } from '@/decorators/field.decorator';

export class UpdateCompanyBodyDto {
  @StringFieldOptional({ swagger: true })
  public name?: string | null;

  @StringFieldOptional({ swagger: true })
  public ntn?: string | null;

  @StringFieldOptional({ swagger: true })
  public email?: string | null;

  @StringFieldOptional({ swagger: true })
  public phone?: string | null;

  @StringFieldOptional({ swagger: true })
  public address?: string | null;

  @StringFieldOptional({ swagger: true })
  public industry?: string | null;

  @StringFieldOptional({ swagger: true })
  public status?: string | null;
}
