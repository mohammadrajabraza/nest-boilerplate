import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { CompanyDto } from '@/modules/companies/dtos/company.dto';
import { UseDto } from '@/decorators/use-dto.decorator';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';

@Entity({ name: 'companies' })
@UseDto(CompanyDto)
export class CompanyEntity extends AbstractEntity<CompanyDto> {
  @Column({ nullable: false, type: 'varchar' })
  public name: string;

  @Column({ nullable: false, type: 'varchar' })
  public ntn: string;

  @Column({ nullable: false, type: 'varchar' })
  public address: string;

  @Column({ nullable: false, type: 'varchar' })
  public email: string;

  @Column({ nullable: false, type: 'varchar' })
  public phone: string;

  @Column({ nullable: false, type: 'varchar' })
  public industry: string;

  @Column({ nullable: false, type: 'varchar' })
  public status: string;

  @OneToMany(() => UserEntity, (user) => user.company)
  users: UserEntity[];
}
