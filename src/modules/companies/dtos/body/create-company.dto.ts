import { StringField } from '@/decorators/field.decorator';

export class CreateCompanyBodyDto {
  @StringField({ swagger: true })
  public name: string;

  @StringField({ swagger: true })
  public ntn: string;

  @StringField({ swagger: true })
  public email: string;

  @StringField({ swagger: true })
  public phone: string;

  @StringField({ swagger: true })
  public address: string;

  @StringField({ swagger: true })
  public industry: string;

  @StringField({ swagger: true })
  public status: string;
}
