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
import {
  FindManyOptions,
  FindOptionsWhere,
  In,
  Like,
  Repository,
} from 'typeorm';
import errorMessage from '@/constants/error-message';
import { CreateCompanyBodyDto } from './dtos/body/create-company.dto';
import CompanyMapper from './infrastructure/persistence/mapper/company.mapper';
import { UpdateCompanyBodyDto } from './dtos/body/update-company.dto';
import toSafeAsync from '@/utils/to-safe-async';
import { UserEntity } from '../users/infrastructure/persistence/entities/user.entity';
import { PageOptionsType } from '@/common/dto/page-options.dto';
import { RoleType } from '@/constants/role-type';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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

  async createCompany(data: CreateCompanyBodyDto) {
    try {
      const company = await this.companyRepository.save(
        CompanyMapper.toPersistence(data),
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

  async listCompany(options?: PageOptionsType & { user?: boolean }) {
    try {
      const where: FindOptionsWhere<CompanyEntity> = {};
      if (options?.q && typeof options.q === 'string') {
        where.name = Like(options.q);
      }

      const findOptions: FindManyOptions<CompanyEntity> = {
        where,
      };

      if (options && options.take && options.skip) {
        findOptions.take = options.take;
        findOptions.skip = options.skip;
      }

      if (options && options.user) {
        findOptions.where = {
          ...(findOptions.where || {}),
          users: {
            userRoles: {
              role: {
                name: In([RoleType.GUEST, RoleType.USER]),
              },
            },
          },
        };
        findOptions.relations = {
          ...(findOptions.relations || {}),
          users: {
            userRoles: {
              role: true,
            },
          },
        };
      }

      const companies = await this.companyRepository.find(findOptions);
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

  async updateCompany(id: string, data: UpdateCompanyBodyDto) {
    const company = await this.getCompanyById(id as Uuid);

    if (data.name) {
      const result = await toSafeAsync(this.findOne({ name: data.name }));
      if (result.success) {
        throw new ConflictException(errorMessage.COMPANY.ALREADY_EXISTS);
      }
    }

    try {
      const companyEntity = CompanyMapper.toPersistence(data, company);
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

  async deleteCompany(id: string) {
    const company = await this.getCompanyById(id as Uuid);

    try {
      await this.userRepository.update(
        { companyId: company.id },
        { companyId: null },
      );
      await this.companyRepository.delete({ id: company.id });
    } catch (error) {
      Logger.error(`Error in companyService.deleteCompany ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        errorMessage.COMPANY.DELETION_FAILED,
      );
    }
  }
}
