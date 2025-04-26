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
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import errorMessage from '@/constants/error-message';
import toSafeAsync from '@/utils/to-safe-async';
import { CreateRoleBodyDto } from './dtos/body/create-role.dto';
import CreateRoleMapper from './infrastructure/persistence/mapper/role.mapper';
import RoleMapper from './infrastructure/persistence/mapper/role.mapper';
import { UpdateRoleBodyDto } from './dtos/body/update-role.dto';
import { UserRoleEntity } from './infrastructure/persistence/entities/user-role.entity';
import { PageOptionsType } from '@/common/dto/page-options.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  async createRole(body: CreateRoleBodyDto) {
    try {
      const result = await toSafeAsync(this.getRoleByName(body.name));
      if (result.success) {
        throw new BadRequestException(errorMessage.ROLE.ALREADY_EXISTS);
      }
      const role = await this.roleRepository.save(
        CreateRoleMapper.toPersistence(body),
      );
      return role;
    } catch (error) {
      Logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(errorMessage.ROLE.CREATION_FAILED);
    }
  }

  async listRoles(options?: PageOptionsType) {
    try {
      const where: FindOptionsWhere<RoleEntity> = {};
      if (options?.q && typeof options.q === 'string') {
        where.name = Like(options.q);
      }
      return await this.roleRepository.find({
        skip: options?.skip,
        take: options?.take,
        where,
      });
    } catch (error) {
      Logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
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

  async deleteRole(id: string) {
    const role = await this.getRoleById(id as Uuid);
    try {
      await this.userRoleRepository.delete({ roleId: role.id });
      await this.roleRepository.delete({ id: role.id });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.ROLE.DELETION_FAILED);
    }
  }

  async updateRole(id: string, data: UpdateRoleBodyDto) {
    const role = await this.getRoleById(id as Uuid);
    try {
      const updatedRole = await this.roleRepository.save(
        RoleMapper.toPersistence(
          {
            name: data.name || undefined,
            description: data.description || undefined,
          },
          role,
        ),
      );
      return updatedRole;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.ROLE.DELETION_FAILED);
    }
  }
}
