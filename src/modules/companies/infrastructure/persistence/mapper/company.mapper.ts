import { CreateCompanyBodyDto } from '@/modules/companies/dtos/body/create-company.dto';
import { CompanyEntity } from '../entities/company.entity';
import { plainToInstance } from 'class-transformer';
import { CompanyResponseDto } from '@/modules/companies/dtos/response/company.dto';
import successMessage from '@/constants/success-message';
import { HttpStatus } from '@nestjs/common';
import { ListCompanyResponseDto } from '@/modules/companies/dtos/response/list-company.dto';
import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { UpdateCompanyBodyDto } from '@/modules/companies/dtos/body/update-company.dto';

type CompanyAction = 'CREATE' | 'LIST' | 'GET' | 'UPDATE' | 'DELETE';

class CompanyMapper {
  public static toDomain<TAction extends CompanyAction>(
    data: TAction extends 'LIST'
      ? CompanyEntity[]
      : TAction extends 'DELETE'
        ? null
        : CompanyEntity,
    action: TAction,
  ) {
    if (action === 'LIST' && data && Array.isArray(data)) {
      return new ListCompanyResponseDto(
        data.map((i) => i.toDto()),
        successMessage.ROLE.LIST,
        HttpStatus.OK,
      );
    } else if (action === 'DELETE' && !data) {
      const DeleteResponse = BaseResponseMixin(class {});
      return new DeleteResponse({}, successMessage.ROLE.DELETE, HttpStatus.OK);
    } else if (data && !Array.isArray(data)) {
      const response = new CompanyResponseDto(
        data.toDto(),
        successMessage.ROLE[action],
        action === 'CREATE' ? HttpStatus.CREATED : HttpStatus.OK,
      );
      return response;
    }
    throw new Error('Invalid action');
  }

  public static toPersistence(
    body: CreateCompanyBodyDto | UpdateCompanyBodyDto,
    role: CompanyEntity | object = {},
  ) {
    return plainToInstance(CompanyEntity, {
      ...role,
      ...body,
    });
  }
}

export default CompanyMapper;
