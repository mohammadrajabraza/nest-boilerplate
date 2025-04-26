import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { RoleType } from '@/constants/role-type';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CompanyResponseDto } from './dtos/response/company.dto';
import { Roles } from '@/decorators/role.decorator';
import { CreateCompanyBodyDto } from './dtos/body/create-company.dto';
import CompanyMapper from './infrastructure/persistence/mapper/company.mapper';
import { ListCompanyResponseDto } from './dtos/response/list-company.dto';
import { UpdateCompanyBodyDto } from './dtos/body/update-company.dto';
import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { GetCompaniesQueryDto } from './dtos/query/get-companies.dto';
import { UserService } from '../users/user.service';

@Controller({ path: 'companies' })
export class CompanyController {
  constructor(
    private companyService: CompanyService,
    private userService: UserService,
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: CompanyResponseDto,
  })
  @ApiBearerAuth()
  async createCompany(@Body() body: CreateCompanyBodyDto) {
    const company = await this.companyService.createCompany(body);
    return CompanyMapper.toDomain(company, 'CREATE');
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: ListCompanyResponseDto,
  })
  @ApiBearerAuth()
  async getCompanies(@Query() query: GetCompaniesQueryDto) {
    const { user, ...pageOptions } = query;
    const options = {
      ...pageOptions,
      skip: query.skip,
    };
    const companies = await this.companyService.listCompany({
      ...options,
      user,
    });

    return CompanyMapper.toDomain(companies, 'LIST', options);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: CompanyResponseDto,
  })
  @ApiBearerAuth()
  async getCompanyById(@Param('id') id: string) {
    const company = await this.companyService.getCompanyById(id as Uuid);
    return CompanyMapper.toDomain(company, 'GET');
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: CompanyResponseDto,
  })
  @ApiBearerAuth()
  async updateRole(
    @Param('id') id: string,
    @Body() body: UpdateCompanyBodyDto,
  ) {
    console.log(id);
    const company = await this.companyService.updateCompany(id, body);
    return CompanyMapper.toDomain(company, 'UPDATE');
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: BaseResponseMixin(class {}),
  })
  @ApiBearerAuth()
  async deleteRole(@Param('id') id: string) {
    await this.companyService.deleteCompany(id);
    return CompanyMapper.toDomain(null, 'DELETE');
  }
}
