import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './infrastructure/persistence/entities/role.entity';
import { Repository } from 'typeorm';
import errorMessage from '@/constants/error-message';
import toSafeAsync from '@/utils/to-safe-async';
import { CreateRoleBodyDto } from './dtos/body/create-role.dto';
import CreateRoleMapper from './infrastructure/persistence/mapper/role.mapper';
import RoleMapper from './infrastructure/persistence/mapper/role.mapper';
import { UpdateRoleBodyDto } from './dtos/body/update-role.dto';
import { UserRoleEntity } from './infrastructure/persistence/entities/user-role.entity';
import { PageOptionsType } from '@/common/dto/page-options.dto';
import { GetRolesQueryDto } from './dtos/query/get-roles.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  async createRole(body: CreateRoleBodyDto, createdBy: Uuid) {
    try {
      const result = await toSafeAsync(this.getRoleByName(body.name));
      if (result.success) {
        throw new BadRequestException(errorMessage.ROLE.ALREADY_EXISTS);
      }
      const roleData = CreateRoleMapper.toPersistence(body, {
        createdBy,
      });

      const savedRole = await this.roleRepository.save(roleData);

      // Fix here: force class prototype onto plain object
      Object.setPrototypeOf(savedRole, RoleEntity.prototype);

      return savedRole;
    } catch (error) {
      Logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(errorMessage.ROLE.CREATION_FAILED);
    }
  }
  async listRoles(options?: GetRolesQueryDto) {
    try {
      const query = this.roleRepository.createQueryBuilder('role');

      if (options?.q && typeof options.q === 'string') {
        query.where('role.name LIKE :q', { q: `%${options.q}%` });
      }

      if (typeof options?.skip === 'number') {
        query.skip(options.skip);
      }

      if (typeof options?.take === 'number') {
        query.take(options.take);
      }

      if (options?.sort && options?.order) {
        query.orderBy(`role.${options.sort}`, options.order.toUpperCase() as 'ASC' | 'DESC');
      }

      return await query.getMany();
    } catch (error) {
      Logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(errorMessage.ROLE.LIST_FAILED);
    }
  }

  async countRole(options?: Pick<PageOptionsType, 'q'>) {
    try {
      const query = this.roleRepository.createQueryBuilder('role');

      if (options?.q && typeof options.q === 'string') {
        query.where('role.name LIKE :q', { q: `%${options.q}%` });
      }

      return await query.getCount();
    } catch (error) {
      Logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(errorMessage.ROLE.LIST_FAILED);
    }
  }

  async getRoleById(id: Uuid) {
    try {
      const role = await this.roleRepository.findOne({
        where: { id },
      });
      if (!role) {
        throw new NotFoundException(errorMessage.ROLE.NOT_FOUND);
      }
      return role;
    } catch (error) {
      Logger.error(`Error in roleService.findOne ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(errorMessage.USER.FIND_ONE_FAILED);
    }
  }

  async getRoleByName(name: string) {
    try {
      const role = await this.roleRepository.findOne({
        where: { name },
      });
      if (!role) {
        throw new NotFoundException(errorMessage.ROLE.NOT_FOUND);
      }
      return role;
    } catch (error) {
      Logger.error(`Error in roleService.findOne ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(errorMessage.USER.FIND_ONE_FAILED);
    }
  }

  async deleteRole(id: string, deletedBy: Uuid): Promise<void> {
    const role = await this.getRoleById(id as Uuid);
    if (!role) {
      throw new NotFoundException(errorMessage.ROLE.NOT_FOUND);
    }

    try {
      await this.userRoleRepository.update({ roleId: role.id }, { deletedById: deletedBy, deletedAt: new Date() });
      await this.roleRepository.update({ id: role.id }, { deletedById: deletedBy, deletedAt: new Date() });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.ROLE.DELETION_FAILED);
    }
  }

  async updateRole(id: string, data: UpdateRoleBodyDto, updatedBy: Uuid) {
    const role = await this.getRoleById(id as Uuid);
    try {
      const updatedRole = await this.roleRepository.save(
        RoleMapper.toPersistence(
          {
            name: data.name || undefined,
            description: data.description || undefined,
          },
          { ...role, updatedBy },
        ),
      );
      return updatedRole;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.ROLE.UPDATION_FAILED);
    }
  }
}
