import { CreateCompanyBodyDto } from '@/modules/companies/dtos/body/create-company.dto';
import { CompanyEntity } from '../entities/company.entity';
import { plainToInstance } from 'class-transformer';
import { CompanyResponseDto } from '@/modules/companies/dtos/response/company.dto';
import successMessage from '@/constants/success-message';
import { HttpStatus } from '@nestjs/common';
import { ListCompanyResponseDto } from '@/modules/companies/dtos/response/list-company.dto';
import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { UpdateCompanyBodyDto } from '@/modules/companies/dtos/body/update-company.dto';
import {
  IPageMetaDtoParameters,
  PageMetaDto,
} from '@/common/dto/page-meta.dto';

type CompanyAction = 'CREATE' | 'LIST' | 'GET' | 'UPDATE' | 'DELETE';

class CompanyMapper {
  public static toDomain<
    TAction extends CompanyAction,
    TOptions extends TAction extends 'LIST'
      ? IPageMetaDtoParameters['pageOptionsDto']
      : null = TAction extends 'LIST'
      ? IPageMetaDtoParameters['pageOptionsDto']
      : null,
  >(
    data: TAction extends 'LIST'
      ? CompanyEntity[]
      : TAction extends 'DELETE'
        ? null
        : CompanyEntity,
    action: TAction,
    options?: TOptions,
  ) {
    if (action === 'LIST' && data && Array.isArray(data) && options) {
      return new ListCompanyResponseDto(
        data.map((i) => i.toDto()),
        new PageMetaDto({
          pageOptionsDto: options,
          itemCount: data.length,
        }),
        successMessage.COMPANY.LIST,
        HttpStatus.OK,
      );
    } else if (action === 'DELETE' && !data) {
      const DeleteResponse = BaseResponseMixin(class {});
      return new DeleteResponse(
        {},
        successMessage.COMPANY.DELETE,
        HttpStatus.OK,
      );
    } else if (data && !Array.isArray(data)) {
      const response = new CompanyResponseDto(
        data.toDto(),
        successMessage.COMPANY[action],
        action === 'CREATE' ? HttpStatus.CREATED : HttpStatus.OK,
      );
      return response;
    }
    throw new Error('Invalid action');
  }

  public static toPersistence(
    body: CreateCompanyBodyDto | UpdateCompanyBodyDto,
    company: CompanyEntity | object = {},
  ) {
    return plainToInstance(CompanyEntity, {
      ...company,
      ...body,
    });
  }
}

export default CompanyMapper;
