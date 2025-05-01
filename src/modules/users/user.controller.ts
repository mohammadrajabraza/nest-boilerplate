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
import { GeneratorService } from '@/shared/services/generator.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserBodyDto } from './dtos/body/update-user.dto';
import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import errorMessage from '@/constants/error-message';
import { GetUsersQueryDto } from './dtos/query/get-users.dto';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { UserDto } from './domain/user.dto';
import { Order } from '@/constants/order';
import { UserSort } from '@/constants/sort';

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
  async getUsers(@Query() query: GetUsersQueryDto) {
    const options = {
      page: query.page || 1,
      take: query.take || 10,
      order: query.order || Order.ASC,
      skip: query.skip || 0,
      q: query.q || undefined,
      sort: query.sort || UserSort.CREATED_AT,
    } as GetUsersQueryDto;
    const [users, count] = await Promise.all([
      this.userService.listUsers(
        {
          role: query.role || undefined,
        },
        options,
      ),
      this.userService.countUsers({
        q: options.q,
        role: query.role,
      }),
    ]);
    return UserMapper.toDomain(users, 'LIST', {
      pageOptionsDto: options,
      itemCount: count,
    });
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleType.ADMIN)
  @ApiResponse({
    type: UserResponseDto,
    status: HttpStatus.CREATED,
  })
  @ApiBearerAuth()
  async createUser(
    @Body() body: CreateUserBodyDto,
    @CurrentUser() admin: UserDto,
  ) {
    const password = this.generetorService.generateRandomPassword();
    await this.userService.checkUserByEmail(body.email);

    const user = await this.userService.create(
      {
        ...body,
        provider: AuthProviders.EMAIL,
        password: password,
        isPasswordReset: false,
      },
      admin.id,
    );

    if (!user) {
      throw new InternalServerErrorException(errorMessage.USER.CREATION_FAILED);
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
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserBodyDto,
    @CurrentUser() admin: UserDto,
  ) {
    const user = await this.userService.updateUserWithRoleAndProfile(
      id as Uuid,
      body,
      admin.id,
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
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() CurrentUser: UserDto,
  ) {
    await this.userService.deleteUser(id as Uuid, CurrentUser.id);
    return UserMapper.toDomain(null, 'DELETE');
  }
}
