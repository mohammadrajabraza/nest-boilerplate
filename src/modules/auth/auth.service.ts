import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { HashingService } from '@/shared/services/hashing.service';
import errorMessage from '@/constants/error-message';
import toSafeAsync from '@/utils/to-safe-async';
import { EmailLoginBodyDto } from './dtos/body/email-login.dto';
import { EmailSignupBodyDto } from './dtos/body/email-signup.dto';
import { CompanyService } from '../companies/company.service';
import { isRole } from '@/utils/is-role';
import { TokenType } from '@/constants/token-type';
import { JwtPayload, PassowrdResetPayload, SocialRequest } from '@/types/jwt';
import { TokenService } from '../token/token.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { SessionEntity } from './infrastructure/persistence/entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { SessionDto } from './domain/session.dto';
import { RefreshTokenBody } from './dtos/body/refresh-token.dto';
import { RoleType } from '@/constants/role-type';
import { AuthProviders } from '@/constants/auth-providers';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private hashingService: HashingService,
    private companyService: CompanyService,
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
  ) {}

  async login(data: Pick<EmailLoginBodyDto, 'email' | 'password'>) {
    const result = await toSafeAsync(
      this.userService.findOne({ email: data.email }),
    );
    if (!result.success) {
      throw new UnauthorizedException(errorMessage.AUTH.INVALID_CREDENTIALS);
    }
    const user = result.data;
    if (
      !user.authProviders.includes(AuthProviders.EMAIL) ||
      user.password === 'invalid'
    ) {
      throw new UnauthorizedException(
        errorMessage.AUTH.CANNOT_LOGIN_WITH_EMAIL,
      );
    }

    const isPasswordMatch = await this.hashingService.compare(
      data.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException(errorMessage.AUTH.INVALID_CREDENTIALS);
    }

    const settings = await this.userService.getUserSettings(user.id);

    if (!settings.isEmailVerified) {
      throw new UnauthorizedException(errorMessage.AUTH.EMAIL_NOT_VERIFIED);
    }

    return { user, isPasswordReset: settings.isPasswordReset };
  }

  async startSession(
    payload: Omit<JwtPayload, 'type'>,
    data: Pick<EmailLoginBodyDto, 'deviceToken' | 'timeZone'>,
  ) {
    const [access, refresh] = await Promise.all([
      this.tokenService.signAccessToken({ ...payload, type: TokenType.ACCESS }),
      this.tokenService.signRefreshToken({
        ...payload,
        type: TokenType.REFRESH,
      }),
    ]);

    try {
      await this.sessionRepository.save(
        plainToInstance(SessionEntity, {
          accessToken: access.token,
          refreshToken: refresh.token,
          deviceToken: data.deviceToken,
          timeZone: data.timeZone,
          loginAt: new Date(),
          isLoggedIn: true,
          userId: payload.userId,
        }),
      );

      return { access, refresh };
    } catch (error) {
      Logger.error(error);
      throw new UnauthorizedException('Session initialization failed');
    }
  }

  async checkSession(where: FindOptionsWhere<SessionEntity>) {
    try {
      const session = await this.sessionRepository.findOneOrFail({
        where,
      });

      if (!session.isLoggedIn || !!session.logoutAt) {
        throw new UnauthorizedException(errorMessage.SESSION.ALREAD_LOGOUT);
      }

      return session;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException(errorMessage.SESSION.NOT_FOUND);
    }
  }

  async refreshSession(
    payload: Omit<JwtPayload, 'type'>,
    session: SessionDto,
    body: RefreshTokenBody,
  ) {
    const [access, refresh] = await Promise.all([
      this.tokenService.signAccessToken({ ...payload, type: TokenType.ACCESS }),
      this.tokenService.signRefreshToken({
        ...payload,
        type: TokenType.REFRESH,
      }),
    ]);

    try {
      await this.sessionRepository.update(
        { id: session.id },
        {
          accessToken: access.token,
          refreshToken: refresh.token,
          ...body,
        },
      );

      return { access, refresh };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException(errorMessage.SESSION.UPDATE_FAILED);
    }
  }

  async signup(data: EmailSignupBodyDto) {
    await this.userService.checkUserByEmail(data.email);
    if (data.companyId) {
      const company = await this.companyService.getCompanyById(
        data.companyId as Uuid,
      );

      data.companyId = company.id;
    }

    const createdUser = await this.userService.create({
      ...data,
      provider: AuthProviders.EMAIL,
    });

    const user = await this.userService.findOne({ id: createdUser.id });

    return {
      payload: {
        userId: user.id,
        email: user.email,
        role: isRole(data.role),
        type: TokenType.CONFIRM_EMAIL,
      },
      user,
    };
  }

  async verifyEmail(userId: Uuid) {
    await this.userService.findOne({ id: userId });
    const isVerified = await this.userService.checkIsEmailVerified(userId);
    if (isVerified) {
      throw new ForbiddenException(errorMessage.AUTH.EMAIL_ALREADY_VERIFIED);
    }
    await this.userService.updateUserProfileSetting(userId, {
      isEmailVerified: true,
    });
  }

  async resendEmail(email: string) {
    const user = await this.userService.findOne({ email });
    const isVerified = await this.userService.checkIsEmailVerified(user.id);
    if (isVerified) {
      throw new ForbiddenException(errorMessage.AUTH.EMAIL_ALREADY_VERIFIED);
    }

    return {
      userId: user.id,
      email: user.email,
      role: isRole(user.userRoles[0].role.name),
      type: TokenType.CONFIRM_EMAIL,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findOne({ email });

    return {
      userId: user.id,
      email: user.email,
      role: isRole(user.userRoles[0].role.name),
      type: TokenType.PASSWORD_RESET,
    } as PassowrdResetPayload;
  }

  async resetPassword(userId: Uuid, password: string) {
    const user = await this.userService.findOne({ id: userId });

    await this.userService.updateUser(user.id, { password });
  }

  async logout(session: SessionDto) {
    const [access, refresh] = await Promise.all([
      this.tokenService.getToken(session.accessToken, TokenType.ACCESS),
      this.tokenService.getToken(session.refreshToken, TokenType.REFRESH),
    ]);

    await Promise.all([
      this.tokenService.revokeToken(access.toDto()),
      this.tokenService.revokeToken(refresh.toDto()),
    ]);

    try {
      await this.sessionRepository.update(
        { id: session.id },
        {
          isLoggedIn: false,
          logoutAt: new Date(),
        },
      );
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(errorMessage.AUTH.LOGOUT_FAILED);
    }
  }

  async googleAuth(data: SocialRequest<'google'>['user']) {
    const result = await toSafeAsync(
      this.userService.findOne({ email: data.email }),
    );

    if (!result.success) {
      const user = await this.userService.create({
        firstName: data.name,
        lastName: '',
        email: data.email,
        provider: AuthProviders.GOOGLE,
        googleId: data.providerId,
        role: RoleType.USER,
        password: 'invalid' as string,
      });

      return user;
    }

    if (result.data.authProviders.includes(AuthProviders.GOOGLE)) {
      if (result.data.googleId !== data.providerId.toString()) {
        throw new UnauthorizedException(
          errorMessage.AUTH.GOOGLE_ACCOUNT_MISMATCH,
        );
      }

      return result.data;
    }

    await this.userService.updateUser(result.data.id, {
      authProviders: Array.from(
        new Set([...(result.data.authProviders || []), AuthProviders.GOOGLE]),
      ),
      googleId: data.providerId.toString(),
      profilePicture: data.picture,
    });

    return await this.userService.findOne({ id: result.data.id });
  }
}
