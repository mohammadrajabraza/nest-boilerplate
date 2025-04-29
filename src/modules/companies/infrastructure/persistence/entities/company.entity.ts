import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { CompanyDto } from '@/modules/companies/domain/company.dto';
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

  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.companyCreators)
  creator: UserEntity | null;

  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.companyUpdators)
  updator: UserEntity | null;

  @JoinColumn({ name: 'deleted_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.companyDeletors)
  deletor: UserEntity | null;
}
