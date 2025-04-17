import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import errorMessage from '@/constants/error-message';
import { RoleType } from '@/constants/role-type';
import { RoleService } from '../roles/role.service';
import { EmailSignupBodyDto } from '../auth/dtos/body/email-signup.dto';
import { UserRoleEntity } from '../roles/infrastructure/persistence/entities/user-role.entity';
import toSafeAsync from '@/utils/to-safe-async';
import { plainToInstance } from 'class-transformer';
import { ProfileSettingEntity } from './infrastructure/persistence/entities/profile-setting.entity';

@Injectable()
export class UserService {
  constructor(
    private roleService: RoleService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity)
    private userRoleRepository: Repository<UserRoleEntity>,
    @InjectRepository(ProfileSettingEntity)
    private profileSettingRepository: Repository<ProfileSettingEntity>,
  ) {}

  async findOne(
    payload: Omit<FindOptionsWhere<UserEntity>, 'roleId'> & { role?: RoleType },
  ) {
    const { role, ...rest } = payload;
    const where: FindOptionsWhere<UserEntity> = rest;
    if (role) {
      const roleEntity = await this.roleService.getRoleByName(role);
      where.userRoles = {
        roleId: roleEntity.id,
      };
    }

    try {
      const user = await this.userRepository.findOne({
        where,
        relations: {
          userRoles: {
            role: true,
          },
        },
      });
      if (!user) {
        throw new NotFoundException(errorMessage.USER.NOT_FOUND);
      }
      return user;
    } catch (error) {
      Logger.error(`Error in userService.findOne ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(errorMessage.USER.FIND_ONE_FAILED);
    }
  }

  async checkUserByEmail(email: string) {
    const result = await toSafeAsync(this.findOne({ email }));
    if (result.success && result.data) {
      throw new ConflictException(errorMessage.USER.ALREADY_EXISTS);
    }
  }

  async create(data: EmailSignupBodyDto) {
    const role = await this.roleService.getRoleByName(data.role);

    try {
      const userEntity = new UserEntity();
      userEntity.firstName = data.firstName;
      userEntity.lastName = data.lastName;
      userEntity.email = data.email;
      userEntity.phone = data.phone;
      userEntity.password = data.password;
      userEntity.companyId = data.companyId;
      const user = await this.userRepository.save(userEntity);
      const userRoleEntity = new UserRoleEntity();
      userRoleEntity.userId = user.id;
      userRoleEntity.roleId = role.id;
      const profileSettingEntity = new ProfileSettingEntity();
      profileSettingEntity.isEmailVerified = false;
      profileSettingEntity.isPhoneVerified = false;
      profileSettingEntity.userId = user.id;
      await Promise.all([
        this.userRoleRepository.save(userRoleEntity),
        this.profileSettingRepository.save(profileSettingEntity),
      ]);
      return user;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.USER.CREATION_FAILED);
    }
  }

  async updateUserProfileSetting(id: Uuid, data: { isEmailVerified: boolean }) {
    const setting = await this.findUserProfileSetting(id);

    try {
      return await this.profileSettingRepository.save(
        plainToInstance(ProfileSettingEntity, { ...setting, ...data }),
      );
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.USER.UPDATION_FAILED);
    }
  }

  public async findUserProfileSetting(userId: Uuid) {
    try {
      const profileSetting = await this.profileSettingRepository.findOneOrFail({
        where: { userId: userId },
      });

      return profileSetting;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(
        errorMessage.PROFILE_SETTING.NOT_FOUND,
      );
    }
  }

  public async checkIsEmailVerified(userId: Uuid) {
    try {
      const profileSetting = await this.profileSettingRepository.findOneOrFail({
        where: { userId: userId },
      });

      return profileSetting.isEmailVerified;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(
        errorMessage.PROFILE_SETTING.NOT_FOUND,
      );
    }
  }

  async updateUser(userId: Uuid, { password }: { password: string }) {
    try {
      await this.userRepository.update(userId, { password });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.USER.UPDATION_FAILED);
    }
  }
}
