import {
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

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

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
}
