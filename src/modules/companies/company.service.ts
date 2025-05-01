import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity } from './infrastructure/persistence/entities/company.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import errorMessage from '@/constants/error-message';
import { CreateCompanyBodyDto } from './dtos/body/create-company.dto';
import CompanyMapper from './infrastructure/persistence/mapper/company.mapper';
import { UpdateCompanyBodyDto } from './dtos/body/update-company.dto';
import toSafeAsync from '@/utils/to-safe-async';
import { UserEntity } from '../users/infrastructure/persistence/entities/user.entity';
import { PageOptionsType } from '@/common/dto/page-options.dto';
import { CompanyStatus } from '@/constants/company-status';
import { GetCompaniesQueryDto } from './dtos/query/get-companies.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getCompanyById(id: Uuid, options?: { user?: boolean }) {
    try {
      let companyQuery = this.companyRepository
        .createQueryBuilder('company')
        .where('company.id = :id', { id });

      // {
      //   where: { id },
      //   relations: {
      //     ...(options?.user && {
      //       users: {
      //         userRoles: true,
      //       },
      //     }),
      //   },
      // }

      if (options?.user) {
        companyQuery = companyQuery
          .leftJoinAndSelect('company.users', 'users')
          .leftJoinAndSelect('users.userRoles', 'userRole')
          .leftJoinAndSelect('userRole.role', 'role');
      }

      const comapany = await companyQuery.getOne();

      if (!comapany) {
        throw new NotFoundException(errorMessage.COMPANY.NOT_FOUND);
      }
      return comapany;
    } catch (error) {
      Logger.error(`Error in companyService.getCompanyById ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        errorMessage.COMPANY.GET_BY_ID_FAILED,
      );
    }
  }

  async createCompany(data: CreateCompanyBodyDto, createdBy: Uuid) {
    try {
      const company = await this.companyRepository.save(
        CompanyMapper.toPersistence(data, {
          createdBy,
          status: CompanyStatus.ACCEPTED,
        }),
      );
      return company;
    } catch (error) {
      Logger.error(`Error in companyService.createCompany ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        errorMessage.COMPANY.CREATION_FAILED,
      );
    }
  }

  async listCompany(options?: GetCompaniesQueryDto) {
    try {
      let query = this.companyRepository.createQueryBuilder('company');

      if (options?.q && typeof options.q === 'string') {
        query.where('company.name LIKE :q', { q: `%${options.q}%` });
      }

      if (typeof options?.skip === 'number') {
        query.skip(options.skip);
      }

      if (typeof options?.take === 'number') {
        query.take(options.take);
      }

      if (options?.sort && options?.order) {
        query.orderBy(
          `company.${options.sort}`,
          options.order.toUpperCase() as 'ASC' | 'DESC',
        );
      }

      if (options?.user) {
        query = query
          .leftJoinAndSelect('company.users', 'users')
          .leftJoinAndSelect('users.userRoles', 'userRole')
          .leftJoinAndSelect('userRole.role', 'role');
      }

      const companies = await query.getMany();
      return companies;
    } catch (error) {
      Logger.error(`Error in companyService.listCompany ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(errorMessage.COMPANY.LIST_FAILED);
    }
  }

  async countCompany(options?: Pick<PageOptionsType, 'q'>) {
    try {
      const query = this.companyRepository.createQueryBuilder('company');

      if (options?.q && typeof options.q === 'string') {
        query.where('company.name LIKE :q', { q: `%${options.q}%` });
      }
      const companies = await query.getCount();
      return companies;
    } catch (error) {
      Logger.error(`Error in companyService.listCompany ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(errorMessage.COMPANY.LIST_FAILED);
    }
  }

  async findOne(where: FindOptionsWhere<CompanyEntity>) {
    try {
      const company = await this.companyRepository.findOne({ where });
      if (!company) {
        throw new NotFoundException(errorMessage.COMPANY.NOT_FOUND);
      }
      return company;
    } catch (error) {
      Logger.error(`Error in companyService.findOne ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        errorMessage.COMPANY.FIND_ONE_FAILED,
      );
    }
  }

  async updateCompany(id: string, data: UpdateCompanyBodyDto, updatedBy: Uuid) {
    const company = await this.getCompanyById(id as Uuid);

    if (data.name) {
      const result = await toSafeAsync(this.findOne({ name: data.name }));
      if (result.success) {
        throw new ConflictException(errorMessage.COMPANY.ALREADY_EXISTS);
      }
    }

    try {
      const companyEntity = CompanyMapper.toPersistence(data, {
        ...company,
        updatedBy,
      });
      await this.companyRepository.save(companyEntity);
      return await this.getCompanyById(company.id);
    } catch (error) {
      Logger.error(`Error in companyService.updateCompany ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        errorMessage.COMPANY.UPDATION_FAILED,
      );
    }
  }

  async deleteCompany(id: string, deletedBy: Uuid) {
    const company = await this.getCompanyById(id as Uuid);

    try {
      await this.userRepository.update(
        { companyId: company.id },
        { companyId: null },
      );
      await this.companyRepository.update(
        { id: company.id },
        {
          deletedAt: new Date(),
          deletedBy: deletedBy,
        },
      );
    } catch (error) {
      Logger.error(`Error in companyService.deleteCompany ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        errorMessage.COMPANY.DELETION_FAILED,
      );
    }
  }
}
