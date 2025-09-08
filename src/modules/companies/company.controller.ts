import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
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
import { CurrentUser } from '@/decorators/current-user.decorator';
import { UserDto } from '../users/domain/user.dto';
import { GetCompanyByIdQueryDto } from './dtos/query/get-company-by-id.dto';
import { Order } from '@/constants/order';
import { CompanySort } from '@/constants/sort';

@Controller({ path: 'companies', version: '1' })
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: CompanyResponseDto,
  })
  @ApiBearerAuth()
  async createCompany(@Body() body: CreateCompanyBodyDto, @CurrentUser() admin: UserDto) {
    const company = await this.companyService.createCompany(body, admin.id);
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
    const options = {
      page: query.page || 1,
      take: query.take || 10,
      order: query.order || Order.ASC,
      skip: query.skip || 0,
      q: query.q || undefined,
      sort: query.sort || CompanySort.CREATED_AT,
      user: query.user === true ? true : false,
    } as GetCompaniesQueryDto;
    const [companies, count] = await Promise.all([
      this.companyService.listCompany(options),
      this.companyService.countCompany({
        q: options.q,
      }),
    ]);

    return CompanyMapper.toDomain(companies, 'LIST', {
      pageOptionsDto: options,
      itemCount: count,
    });
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: CompanyResponseDto,
  })
  @ApiBearerAuth()
  async getCompanyById(@Param('id') id: string, @Query() query: GetCompanyByIdQueryDto) {
    const company = await this.companyService.getCompanyById(id as Uuid, query);
    return CompanyMapper.toDomain(company, 'GET');
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: CompanyResponseDto,
  })
  @ApiBearerAuth()
  async updateRole(@Param('id') id: string, @Body() body: UpdateCompanyBodyDto, @CurrentUser() admin: UserDto) {
    console.log(id);
    const company = await this.companyService.updateCompany(id, body, admin.id);
    return CompanyMapper.toDomain(company, 'UPDATE');
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: BaseResponseMixin(class {}),
  })
  @ApiBearerAuth()
  async deleteRole(@Param('id') id: string, @CurrentUser() admin: UserDto) {
    await this.companyService.deleteCompany(id, admin.id);
    return CompanyMapper.toDomain(null, 'DELETE');
  }
}
