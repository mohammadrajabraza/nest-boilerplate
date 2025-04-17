import {
  ForbiddenException,
  Injectable,
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
import { PassowrdResetPayload } from '@/types/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private hashingService: HashingService,
    private companyService: CompanyService,
  ) {}

  async login(data: Omit<EmailLoginBodyDto, 'role'>) {
    const result = await toSafeAsync(
      this.userService.findOne({ email: data.email }),
    );
    if (!result.success) {
      throw new UnauthorizedException(errorMessage.AUTH.INVALID_CREDENTIALS);
    }
    const user = result.data;
    const isPasswordMatch = await this.hashingService.compare(
      data.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException(errorMessage.AUTH.INVALID_CREDENTIALS);
    }

    const isVerified = await this.userService.checkIsEmailVerified(user.id);
    if (!isVerified) {
      throw new UnauthorizedException(errorMessage.AUTH.EMAIL_NOT_VERIFIED);
    }

    return user;
  }

  async signup(data: EmailSignupBodyDto) {
    await this.userService.checkUserByEmail(data.email);
    if (data.companyId) {
      const company = await this.companyService.getCompanyById(
        data.companyId as Uuid,
      );

      data.companyId = company.id;
    }

    const createdUser = await this.userService.create(data);

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
}
