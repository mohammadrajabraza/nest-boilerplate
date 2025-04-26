import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { FindManyOptions, FindOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import errorMessage from '@/constants/error-message';
import { RoleType } from '@/constants/role-type';
import { RoleService } from '../roles/role.service';
import { EmailSignupBodyDto } from '../auth/dtos/body/email-signup.dto';
import { UserRoleEntity } from '../roles/infrastructure/persistence/entities/user-role.entity';
import toSafeAsync from '@/utils/to-safe-async';
import { plainToInstance } from 'class-transformer';
import { ProfileSettingEntity } from './infrastructure/persistence/entities/profile-setting.entity';
import { isRole } from '@/utils/is-role';
import { TokenType } from '@/constants/token-type';
import { AuthProviders } from '@/constants/auth-providers';
import { UpdateUserBodyDto } from './dtos/body/update-user.dto';
import { PageOptionsType } from '@/common/dto/page-options.dto';

type CreateUserData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: RoleType;
  password: string;
  companyId?: string | null;
  provider?: AuthProviders;
  googleId?: string | null;
  isPasswordReset?: boolean;
};

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
  ) { }

  async listUsers(
    payload: Omit<FindOptionsWhere<UserEntity>, 'roleId'> & {
      role?: RoleType;
    } = {},
    options?: PageOptionsType
  ) {
    const { role, ...rest } = payload;
    let where: FindOptionsWhere<UserEntity>[] | FindOptionsWhere<UserEntity> = rest;

    if (role) {
      where.userRoles = {
        role: {
          name: role,
        },
      };
    }

    if (options?.q && typeof options.q === 'string') {
      const currentWhere = (typeof where === 'object'? where: {})
      where = [
        { ...currentWhere, firstName: Like(options.q) },
        { ...currentWhere, lastName: Like(options.q) },
        { ...currentWhere, email: Like(options.q )},
        { ...currentWhere, fullName: Like(options.q) }
      ]
    }

    const findOptions: FindManyOptions<UserEntity> = {
      where,
      relations: {
        userRoles: {
          role: true,
        },
      },  
    }
    if (options && options.take && options.skip) {
      findOptions.take = options.take;
      findOptions.skip = options.skip;
    }

    try {
      const users = await this.userRepository.find(findOptions);
      return users;
    } catch (error) {
      Logger.error(`Error in userService.listUsers ${error.message}`);
      throw new InternalServerErrorException(errorMessage.USER.FIND_ALL_FAILED);
    }
  }

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

  async updateUserProfileSetting(id: Uuid, data: Partial<{ isEmailVerified: boolean, isPasswordReset: boolean }>) {
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

  async create(data: CreateUserData) {
    const role = await this.roleService.getRoleByName(data.role);
    try {
      const userEntity = new UserEntity();
      userEntity.firstName = data.firstName;
      userEntity.lastName = data.lastName;
      userEntity.email = data.email;
      userEntity.phone = data.phone;
      userEntity.password = data.password;

      if (data.companyId) {
        userEntity.companyId = data.companyId;
      }

      if (data.provider === 'google') {
        if (!data.googleId) {
          throw new BadRequestException(
            'Google ID is required for Google signup',
          );
        }
        userEntity.googleId = data.googleId;
      }

      const user = await this.userRepository.save(userEntity);

      const userRoleEntity = new UserRoleEntity();
      userRoleEntity.userId = user.id;
      userRoleEntity.roleId = role.id;

      const profileSettingEntity = new ProfileSettingEntity();
      profileSettingEntity.isEmailVerified = false;
      profileSettingEntity.isPhoneVerified = false;
      profileSettingEntity.isPasswordReset =
        data.isPasswordReset === undefined || data.isPasswordReset === null
          ? true
          : data.isPasswordReset;
      profileSettingEntity.userId = user.id;

      await Promise.all([
        this.userRoleRepository.save(userRoleEntity),
        this.profileSettingRepository.save(profileSettingEntity),
      ]);

      return this.findOne({ id: user.id });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.USER.CREATION_FAILED);
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

  public async getUserSettings(userId: Uuid) {
    try {
      const profileSetting = await this.profileSettingRepository.findOneOrFail({
        where: { userId: userId },
      });

      // if (!profileSetting) {
      //   const setting = await this.profileSettingRepository.save(
      //     plainToInstance(ProfileSettingEntity, {
      //       userId,
      //       isEmailVerified: true,
      //       isPhoneVerified: false,
      //     }),
      //   );
      //   return setting.isEmailVerified;
      // }

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

      // if (!profileSetting) {
      //   const setting = await this.profileSettingRepository.save(
      //     plainToInstance(ProfileSettingEntity, {
      //       userId,
      //       isEmailVerified: true,
      //       isPhoneVerified: false,
      //     }),
      //   );
      //   return setting.isEmailVerified;
      // }

      return profileSetting.isEmailVerified;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(
        errorMessage.PROFILE_SETTING.NOT_FOUND,
      );
    }
  }

  async updateUser(
    userId: Uuid,
    data: {
      password?: string;
      authProviders?: string[];
      googleId?: string;
      profilePicture?: string;
    },
  ) {
    try {
      return await this.userRepository.update(userId, data);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.USER.UPDATION_FAILED);
    }
  }

  async updateUserWithRoleAndProfile(userId: Uuid, data: UpdateUserBodyDto) {
    const existingUser = await this.findOne({ id: userId });

    const isEmailChanged = existingUser.email !== data.email;

    const updatedUser = await this.userRepository.save({
      ...existingUser,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      companyId: data.companyId,
      password: data.password, // hash it if needed here
    });

    // Update role if changed
    const roleEntity = await this.roleService.getRoleByName(data.role);
    const userRole = await this.userRoleRepository.findOneByOrFail({ userId });
    userRole.roleId = roleEntity.id;
    await this.userRoleRepository.save(userRole);

    const profile = await this.findUserProfileSetting(userId);
    if (isEmailChanged) {
      profile.isEmailVerified = false;
    }
    await this.profileSettingRepository.save(profile);

    return this.findOne({ id: userId });
  }


  async deleteUser(userId: Uuid): Promise<void> {
    const user = await this.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException(errorMessage.USER.NOT_FOUND);
    }

    try {
      await this.profileSettingRepository.delete({ userId });
      await this.userRoleRepository.delete({ userId });
      await this.userRepository.delete({ id: userId });

    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.USER.DELETION_FAILED);
    }
  }

}
