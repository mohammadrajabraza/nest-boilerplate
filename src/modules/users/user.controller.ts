import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '@/decorators/role.decorator';
import { ApiBearerAuth, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { RoleType } from '@/constants/role-type';
import { ListUserResponseDto } from './dtos/response/list-user.dto';
import UserMapper from './infrastructure/persistence/mapper/user.mapper';
import { UserResponseDto } from './dtos/response/user.dto';
import { CreateUserBodyDto } from './dtos/body/create-user.dto';
import { MailService } from '@/mail/mail.service';
import { TokenService } from '../token/token.service';
import { AuthProviders } from '@/constants/auth-providers';
import { TokenType } from '@/constants/token-type';
import { isRole } from '@/utils/is-role';
import { GeneratorService } from '@/shared/services/generator.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserBodyDto } from './dtos/body/update-user.dto';
import { BaseResponseMixin } from '@/common/dto/base-response.dto';

@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(
    private userService: UserService,
    private mailService: MailService,
    private tokenService: TokenService,
    private generetorService: GeneratorService,
    private jwtService: JwtService,
  ) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiQuery({
    name: 'role',
    required: false,
    enum: RoleType,
    description: 'Filter users by role',
  })
  @ApiResponse({
    type: ListUserResponseDto,
    status: HttpStatus.OK,
  })
  @ApiBearerAuth()
  async getUsers(@Query('role') role?: RoleType) {
    // Create the payload object expected by listUsers
    const payload = role ? { role } : {};
    const users = await this.userService.listUsers(payload);
    return UserMapper.toDomain(users, 'LIST');
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: UserResponseDto,
    status: HttpStatus.CREATED,
  })
  @ApiBearerAuth()
  async createUser(@Body() body: CreateUserBodyDto) {
    const password = this.generetorService.generateRandomPassword();
    await this.userService.checkUserByEmail(body.email);

    const user = await this.userService.create({
      ...body,
      provider: AuthProviders.EMAIL,
      password: password,
      isPasswordReset: false,
    });

    if (!user) {
      throw new InternalServerErrorException('Failed to create user payload');
    }

    const token = await this.tokenService.signConfirmEmailToken({
      userId: user.id,
      role: body.role,
      email: user.email,
      type: TokenType.CONFIRM_EMAIL,
    });

    await this.mailService.createUser({
      to: user.email,
      data: {
        hash: token.token,
        password: password,
      },
    });

    return UserMapper.toDomain(user, 'CREATE');
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: UserResponseDto,
    status: HttpStatus.OK,
  })
  @ApiBearerAuth()
  async getUserById(@Param('id') id: string, @Query('role') role?: RoleType) {
    const USER = await this.userService.findOne({ id: id as Uuid, role });
    return UserMapper.toDomain(USER, 'GET');
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: UserResponseDto,
    status: HttpStatus.OK,
  })
  @ApiBody({
    type: UpdateUserBodyDto,
  })
  @ApiBearerAuth()
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserBodyDto) {
    const user = await this.userService.updateUserWithRoleAndProfile(
      id as Uuid,
      body,
    );
    return UserMapper.toDomain(user, 'UPDATE');
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: BaseResponseMixin(class {}),
    status: HttpStatus.OK,
  })
  @ApiBearerAuth()
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id as Uuid);
    return UserMapper.toDomain(null, 'DELETE');
  }
}
