import type { CreateRoleBodyDto } from '@/modules/roles/dtos/body/create-role.dto';
import { RoleEntity } from '../entities/role.entity';
import { plainToInstance } from 'class-transformer';
import { RoleResponseDto } from '@/modules/roles/dtos/response/role.dto';
import successMessage from '@/constants/success-message';
import { HttpStatus } from '@nestjs/common';
import { ListRoleResponseDto } from '@/modules/roles/dtos/response/list-role.dto';
import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { type IPageMetaDtoParameters, PageMetaDto } from '@/common/dto/page-meta.dto';

type RoleAction = 'CREATE' | 'LIST' | 'GET' | 'UPDATE' | 'DELETE';

class RoleMapper {
  public static toDomain<
    TAction extends RoleAction,
    TOptions extends TAction extends 'LIST' ? IPageMetaDtoParameters : null = TAction extends 'LIST'
      ? IPageMetaDtoParameters
      : null,
  >(
    role: TAction extends 'LIST' ? RoleEntity[] : TAction extends 'DELETE' ? null : RoleEntity,
    action: TAction,
    options: TOptions = {} as TOptions,
  ) {
    if (action === 'LIST' && role && Array.isArray(role) && options) {
      return new ListRoleResponseDto(
        role.map((r) => r.toDto()),
        new PageMetaDto(options),
        successMessage.ROLE.LIST,
        HttpStatus.OK,
      );
    } else if (action === 'DELETE' && !role) {
      const DeleteResponse = BaseResponseMixin(class {});
      return new DeleteResponse({}, successMessage.ROLE.DELETE, HttpStatus.OK);
    } else if (role && !Array.isArray(role)) {
      const response = new RoleResponseDto(
        role.toDto(),
        successMessage.ROLE[action],
        action === 'CREATE' ? HttpStatus.CREATED : HttpStatus.OK,
      );
      return response;
    }
    throw new Error('Invalid action');
  }

  public static toPersistence(body: Partial<CreateRoleBodyDto>, role: RoleEntity | object = {}) {
    return plainToInstance(RoleEntity, {
      ...role,
      ...body,
    });
  }
}

export default RoleMapper;
