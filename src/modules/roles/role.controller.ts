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
} from '@nestjs/common';
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
  async createRole(@Body() body: CreateRoleBodyDto) {
    const role = await this.roleService.createRole(body);
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
  async getRoles() {
    const roles = await this.roleService.listRoles();
    return RoleMapper.toDomain(roles, 'LIST');
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
  async updateRole(@Param('id') id: string, @Body() body: UpdateRoleBodyDto) {
    const role = await this.roleService.updateRole(id, body);
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
  async deleteRole(@Param('id') id: string) {
    await this.roleService.deleteRole(id);
    return RoleMapper.toDomain(null, 'DELETE');
  }
}
