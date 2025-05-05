import {
  PhoneFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorator';

export class UpdateCompanyBodyDto {
  @StringFieldOptional({ swagger: true })
  public name?: string;

  @StringFieldOptional({ swagger: true })
  public ntn?: string;

  @StringFieldOptional({ swagger: true })
  public email?: string;

  @PhoneFieldOptional({ swagger: true })
  public phone?: string;

  @StringFieldOptional({ swagger: true })
  public address?: string;

  @StringFieldOptional({ swagger: true })
  public industry?: string;
}
