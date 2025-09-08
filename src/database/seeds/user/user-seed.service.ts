import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { RoleType } from '@/constants/role-type';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/entities/role.entity';
import { plainToInstance } from 'class-transformer';
import { CompanyEntity } from '@/modules/companies/infrastructure/persistence/entities/company.entity';
import { UserRoleEntity } from '@/modules/roles/infrastructure/persistence/entities/user-role.entity';
import { ProfileSettingEntity } from '@/modules/users/infrastructure/persistence/entities/profile-setting.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,

    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,

    @InjectRepository(UserRoleEntity)
    private userRoleRepository: Repository<UserRoleEntity>,

    @InjectRepository(ProfileSettingEntity)
    private profileSettingRepository: Repository<ProfileSettingEntity>,
  ) {}

  private roleMap = new Map<string, RoleEntity>();
  private companyMap = new Map<string, CompanyEntity>();

  private get users() {
    return [
      {
        firstName: 'test',
        lastName: 'admin',
        email: 'admin@test.com',
        phone: '+21321838923',
        password: 'abcd1234@A',
        role: RoleType.ADMIN,
        company: 'mycompany',
      },
      {
        firstName: 'test',
        lastName: 'user',
        email: 'user@test.com',
        phone: '+21321238923',
        password: 'abcd1234@A',
        role: RoleType.USER,
        company: 'mycompany',
      },
    ];
  }

  private async getCompany(name: string) {
    let company: CompanyEntity | null | undefined = null;

    if (this.companyMap.has(name)) {
      company = this.companyMap.get(name);
    } else {
      company = await this.companyRepository.findOne({
        where: { name },
      });
    }
    if (!company) {
      throw new Error('Invalid company');
    }

    return company;
  }

  private async getRole(name: string) {
    let role: RoleEntity | null | undefined = null;

    if (this.roleMap.has(name)) {
      role = this.roleMap.get(name);
    } else {
      role = await this.roleRepository.findOne({
        where: { name },
      });
    }
    if (!role) {
      throw new Error('Invalid role');
    }

    return role;
  }

  private async saveUser(data: (typeof this.users)[number]) {
    try {
      const [company, role] = await Promise.all([this.getCompany(data.company), this.getRole(data.role)]);
      const hashedPassword = await bcrypt.hash(data.password, 10);

      let user = await this.userRepository.findOne({
        where: { email: data.email },
      });

      if (user) {
        await this.userRepository.update(
          { id: user.id },
          {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            companyId: company.id,
          },
        );
      } else {
        user = await this.userRepository.save(
          plainToInstance(UserEntity, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            companyId: company.id,
          }),
        );

        await this.userRoleRepository.save(
          plainToInstance(UserRoleEntity, {
            userId: user.id,
            roleId: role.id,
          }),
        );
      }

      // Create or update ProfileSettingEntity
      const profile = await this.profileSettingRepository.findOne({
        where: { userId: user.id },
      });

      const profileData = plainToInstance(ProfileSettingEntity, {
        userId: user.id,
        isEmailVerified: data.role === RoleType.ADMIN,
        isPhoneVerified: false,
        isPasswordReset: true,
      });

      if (profile) {
        await this.profileSettingRepository.update({ userId: user.id }, profileData);
      } else {
        await this.profileSettingRepository.save(profileData);
      }
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async run() {
    await Promise.all(this.users.map((user) => this.saveUser(user)));
  }
}
