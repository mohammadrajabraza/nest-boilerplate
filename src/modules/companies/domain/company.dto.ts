import { AbstractDto } from '@/common/dto/abstract.dto';
import { StringFieldOptional } from '@/decorators/field.decorator';
import type { CompanyEntity } from '../infrastructure/persistence/entities/company.entity';

export class CompanyDto extends AbstractDto {
  @StringFieldOptional({ nullable: false })
  public name: string;

  @StringFieldOptional({ nullable: false })
  public ntn: string;

  @StringFieldOptional({ nullable: false })
  public email: string;

  @StringFieldOptional({ nullable: false })
  public phone: string;

  @StringFieldOptional({ nullable: false })
  public address: string;

  @StringFieldOptional({ nullable: false })
  public industry: string;

  @StringFieldOptional({ nullable: false })
  public status: string;

  constructor(company: CompanyEntity) {
    super(company);
    this.name = company.name;
    this.ntn = company.ntn;
    this.address = company.address;
    this.email = company.email;
    this.industry = company.industry;
    this.phone = company.phone;
    this.status = company.status;
  }
}
