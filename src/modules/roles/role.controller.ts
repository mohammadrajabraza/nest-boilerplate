import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { Roles } from '@/decorators/role.decorator';
import { RoleType } from '@/constants/role-type';
import { CreateRoleBodyDto } from './dtos/body/create-role.dto';
import RoleMapper from './infrastructure/persistence/mapper/role.mapper';
import { UpdateRoleBodyDto } from './dtos/body/update-role.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RoleResponseDto } from './dtos/response/role.dto';
import { ListRoleResponseDto } from './dtos/response/list-role.dto';
import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { GetRolesQueryDto } from './dtos/query/get-roles.dto';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { UserDto } from '../users/domain/user.dto';
import { Order } from '@/constants/order';
import { RoleSort } from '@/constants/sort';

@Controller({ path: 'roles', version: '1' })
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: RoleResponseDto,
    status: HttpStatus.CREATED,
  })
  @ApiBearerAuth()
  async createRole(@Body() body: CreateRoleBodyDto, @CurrentUser() CurrentUser: UserDto) {
    const role = await this.roleService.createRole(body, CurrentUser.id);
    return RoleMapper.toDomain(role, 'CREATE');
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: ListRoleResponseDto,
    status: HttpStatus.OK,
  })
  @ApiBearerAuth()
  async getRoles(@Query() query: GetRolesQueryDto) {
    const options = {
      page: query.page || 1,
      take: query.take || 10,
      order: query.order || Order.ASC,
      sort: query.sort || RoleSort.CREATED_AT,
      skip: query.skip || 0,
      q: query.q || undefined,
    } as GetRolesQueryDto;
    const [roles, count] = await Promise.all([
      this.roleService.listRoles(options),
      this.roleService.countRole({
        q: options.q,
      }),
    ]);
    return RoleMapper.toDomain(roles, 'LIST', {
      pageOptionsDto: options,
      itemCount: count,
    });
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: RoleResponseDto,
    status: HttpStatus.OK,
  })
  @ApiBearerAuth()
  async getRoleById(@Param('id') id: string) {
    const role = await this.roleService.getRoleById(id as Uuid);
    return RoleMapper.toDomain(role, 'GET');
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: RoleResponseDto,
    status: HttpStatus.OK,
  })
  @ApiBearerAuth()
  async updateRole(@Param('id') id: string, @Body() body: UpdateRoleBodyDto, @CurrentUser() admin: UserDto) {
    const role = await this.roleService.updateRole(id, body, admin.id);
    return RoleMapper.toDomain(role, 'UPDATE');
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: BaseResponseMixin(class {}),
    status: HttpStatus.OK,
  })
  @ApiBearerAuth()
  async deleteRole(@Param('id') id: string, @CurrentUser() admin: UserDto) {
    await this.roleService.deleteRole(id, admin.id);
    return RoleMapper.toDomain(null, 'DELETE');
  }
}
