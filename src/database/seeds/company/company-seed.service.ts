import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from '@/modules/companies/infrastructure/persistence/entities/company.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CompanySeedService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
  ) {}

  private get companies() {
    return [
      {
        name: 'mycompany',
        ntn: '123564',
        email: 'company@test.com',
        phone: '+00000000',
        address: 'Earth',
        industry: 'Software Development',
        status: 'accepted',
      },
    ];
  }

  private async saveCompany(data: (typeof this.companies)[number]) {
    try {
      const company = await this.companyRepository.findOne({
        where: { name: data.name },
      });
      if (company) {
        return await this.companyRepository.save(
          plainToInstance(CompanyEntity, { ...company, ...data }),
        );
      }
      return await this.companyRepository.save(
        plainToInstance(CompanyEntity, data),
      );
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async run() {
    await Promise.all(
      this.companies.map((company) => this.saveCompany(company)),
    );
  }
}
