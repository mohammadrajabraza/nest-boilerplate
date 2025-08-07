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
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import errorMessage from '@/constants/error-message';
import { RoleType } from '@/constants/role-type';
import { RoleService } from '../roles/role.service';
import { UserRoleEntity } from '../roles/infrastructure/persistence/entities/user-role.entity';
import toSafeAsync from '@/utils/to-safe-async';
import { plainToInstance } from 'class-transformer';
import { ProfileSettingEntity } from './infrastructure/persistence/entities/profile-setting.entity';
import { AuthProviders } from '@/constants/auth-providers';
import { UpdateUserBodyDto } from './dtos/body/update-user.dto';
import { GetUsersQueryDto } from './dtos/query/get-users.dto';

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
  ) {}

  async listUsers(
    payload: Omit<FindOptionsWhere<UserEntity>, 'roleId'> & {
      role?: RoleType;
    } = {},
    options?: GetUsersQueryDto,
  ) {
    const { role, ...rest } = payload;

    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userRoles', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role');

      // Apply other filters from payload
      Object.entries(rest).forEach(([key, value]) => {
        query.andWhere(`user.${key} = :${key}`, { [key]: value });
      });

      // Filter by role name
      if (role) {
        query.andWhere('role.name = :roleName', { roleName: role });
      }

      // Full-text search
      if (options?.q && typeof options.q === 'string') {
        const q = `%${options.q}%`;
        query.andWhere(
          `(
            user.firstName LIKE :q OR
            user.lastName LIKE :q OR
            user.email LIKE :q OR
            CONCAT(user.firstName, ' ', user.lastName) LIKE :q
          )`,
          { q },
        );
      }

      // Sorting
      if (options?.sort && options?.order) {
        query.orderBy(
          `user.${options.sort}`,
          options.order.toUpperCase() as 'ASC' | 'DESC',
        );
      }

      // Pagination
      if (typeof options?.skip !== 'undefined') {
        query.skip(options.skip);
      }

      if (typeof options?.take !== 'undefined') {
        query.take(options.take);
      }

      return await query.getMany();
    } catch (error) {
      Logger.error(`Error in userService.listUsers ${error.message}`);
      throw new InternalServerErrorException(errorMessage.USER.FIND_ALL_FAILED);
    }
  }

  async countUsers(options?: { q?: string; role?: RoleType | null }) {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.userRoles', 'userRole')
        .leftJoin('userRole.role', 'role');

      if (options?.role) {
        query.andWhere('role.name = :roleName', { roleName: options.role });
      }

      if (options?.q && typeof options.q === 'string') {
        const q = `%${options.q}%`;
        query.andWhere(
          `(
            user.firstName LIKE :q OR
            user.lastName LIKE :q OR
            user.email LIKE :q OR
            CONCAT(user.firstName, ' ', user.lastName) LIKE :q
          )`,
          { q },
        );
      }

      const count = await query.getCount();
      return count;
    } catch (error) {
      Logger.error(`Error in userService.countUsers ${error.message}`);
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

  async updateUserProfileSetting(
    id: Uuid,
    data: Partial<{ isEmailVerified: boolean; isPasswordReset: boolean }>,
  ) {
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

  async create(data: CreateUserData, createdBy: Uuid | null = null) {
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

      if (data.provider) {
        userEntity.authProviders = [data.provider];
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

      const creator = createdBy !== null ? createdBy : user.id;

      const userRoleEntity = new UserRoleEntity();
      userRoleEntity.userId = user.id;
      userRoleEntity.roleId = role.id;
      userRoleEntity.createdById = creator;

      const profileSettingEntity = new ProfileSettingEntity();
      profileSettingEntity.isEmailVerified = false;
      profileSettingEntity.isPhoneVerified = false;
      profileSettingEntity.isPasswordReset =
        data.isPasswordReset === undefined || data.isPasswordReset === null
          ? true
          : data.isPasswordReset;
      profileSettingEntity.userId = user.id;
      profileSettingEntity.createdById = creator;

      await Promise.all([
        this.userRepository.update(user.id, { createdById: creator }),
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
      createdById?: Uuid;
      updatedById?: Uuid;
    },
  ) {
    try {
      return await this.userRepository.update(userId, data);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.USER.UPDATION_FAILED);
    }
  }

  async updateUserWithRoleAndProfile(
    userId: Uuid,
    data: UpdateUserBodyDto,
    updatedBy: Uuid,
  ) {
    const existingUser = await this.findOne({ id: userId });

    const isEmailChanged = data.email && existingUser.email !== data.email;

    if (isEmailChanged) {
      const userFoundWithEmail = await toSafeAsync(
        this.findOne({ email: data.email }),
      );
      if (userFoundWithEmail.success) {
        throw new BadRequestException('Email is already in use');
      }
    }

    await this.userRepository.update(userId, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      companyId: data.companyId,
      password: data.password || undefined,
      updatedById: updatedBy,
    });

    const updatedUser = await this.findOne({ id: userId });

    if (data.role) {
      // Update role if changed
      const roleEntity = await this.roleService.getRoleByName(data.role);
      const userRole = await this.userRoleRepository.findOneByOrFail({
        userId: updatedUser.id,
      });
      userRole.roleId = roleEntity.id;
      await this.userRoleRepository.save(userRole);
    }

    if (isEmailChanged) {
      const profile = await this.findUserProfileSetting(updatedUser.id);
      profile.isEmailVerified = false;
      profile.updatedById = updatedBy;
      await this.profileSettingRepository.save(profile);
    }

    return this.findOne({ id: updatedUser.id });
  }

  async deleteUser(userId: Uuid, deletedBy: Uuid): Promise<void> {
    const user = await this.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException(errorMessage.USER.NOT_FOUND);
    }

    try {
      // Set deletedBy before soft deleting each entity
      await this.profileSettingRepository.update(
        { userId },
        { deletedById: deletedBy, deletedAt: new Date() },
      );
      await this.userRoleRepository.update(
        { userId },
        { deletedById: deletedBy, deletedAt: new Date() },
      );
      await this.userRepository.update(
        { id: userId },
        { deletedById: deletedBy, deletedAt: new Date() },
      );
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.USER.DELETION_FAILED);
    }
  }
}
