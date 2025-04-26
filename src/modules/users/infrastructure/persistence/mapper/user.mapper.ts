import { CreateUserBodyDto } from '@/modules/users/dtos/body/create-user.dto';
import { UpdateUserBodyDto } from '@/modules/users/dtos/body/update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '@/modules/users/dtos/response/user.dto';
import successMessage from '@/constants/success-message';
import { HttpStatus } from '@nestjs/common';
import { ListUserResponseDto } from '@/modules/users/dtos/response/list-user.dto';
import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import {
  IPageMetaDtoParameters,
  PageMetaDto,
} from '@/common/dto/page-meta.dto';
import { PageOptionsType } from '@/common/dto/page-options.dto';

type UserAction = 'CREATE' | 'LIST' | 'GET' | 'UPDATE' | 'DELETE';

class UserMapper {
  public static toDomain<
    TAction extends UserAction,
    TOptions extends TAction extends 'LIST'
      ? IPageMetaDtoParameters['pageOptionsDto']
      : null = TAction extends 'LIST'
      ? IPageMetaDtoParameters['pageOptionsDto']
      : null,
  >(
    user: TAction extends 'LIST'
      ? UserEntity[]
      : TAction extends 'DELETE'
        ? null
        : UserEntity,
    action: TAction,
    options?: TOptions,
  ) {
    if (action === 'LIST' && user && Array.isArray(user) && options) {
      const metadata = new PageMetaDto({
        pageOptionsDto: options as PageOptionsType,
        itemCount: user.length,
      });
      return new ListUserResponseDto(
        user.map((u) => u.toDto()),
        metadata,
        successMessage.USER.LIST,
        HttpStatus.OK,
      );
    } else if (action === 'DELETE' && !user) {
      const DeleteResponse = BaseResponseMixin<object, false>(class {});
      return new DeleteResponse({}, successMessage.USER.DELETE, HttpStatus.OK);
    } else if (user && !Array.isArray(user)) {
      const response = new UserResponseDto(
        user.toDto(),
        successMessage.USER[action],
        action === 'CREATE' ? HttpStatus.CREATED : HttpStatus.OK,
      );
      return response;
    }
    throw new Error('Invalid action');
  }

  public static toPersistence(
    body: Partial<CreateUserBodyDto | UpdateUserBodyDto>,
    user: UserEntity | object = {},
  ) {
    return plainToInstance(UserEntity, {
      ...user,
      ...body,
    });
  }
}

export default UserMapper;
