import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/entities/role.entity';
import { RoleType } from '@/constants/role-type';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) {}

  private get roles() {
    return [
      { name: RoleType.USER, description: 'User role with limited access' },
      { name: RoleType.ADMIN, description: 'Admin role with full access' },
    ];
  }

  private async saveRole(data: (typeof this.roles)[number]) {
    try {
      const roleExists = await this.repository.findOne({
        where: { name: data.name },
      });
      if (roleExists) {
        return await this.repository.save(plainToInstance(RoleEntity, { ...roleExists, ...data }));
      }
      const role = plainToInstance(RoleEntity, data);
      return await this.repository.save(role);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async run() {
    await Promise.all(this.roles.map((role) => this.saveRole(role)));
  }
}
