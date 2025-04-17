import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity } from './infrastructure/persistence/entities/company.entity';
import { Repository } from 'typeorm';
import errorMessage from '@/constants/error-message';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
  ) {}

  async getCompanyById(id: Uuid) {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
      });
      if (!company) {
        throw new NotFoundException(errorMessage.COMPANY.NOT_FOUND);
      }
      return company;
    } catch (error) {
      Logger.error(`Error in companyService.getCompanyById ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        errorMessage.COMPANY.GET_BY_ID_FAILED,
      );
    }
  }
}
