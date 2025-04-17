import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailLoginBodyDto } from './dtos/body/email-login.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { EmailLoginResponseDto } from './dtos/response/email-login.dto';
import { TokenService } from '../token/token.service';
import { TokenType } from '@/constants/token-type';
import { EmailSignupBodyDto } from './dtos/body/email-signup.dto';
import { LoginMapper } from './infrastructure/persistence/mapper/login.mapper';
import { SignupMapper } from './infrastructure/persistence/mapper/signup.mapper';
import { EmailVerifyQueryDto } from './dtos/query/email-verify.dto';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { MailService } from '@/mail/mail.service';
import { EmailResendQueryDto } from './dtos/query/email-resend.dto';
import { isRole } from '@/utils/is-role';
import { EmailResendResponseDto } from './dtos/response/email-resend.dto';
import successMessage from '@/constants/success-message';
import { ForgotPasswordBodyDto } from './dtos/body/forgot-password.dto';
import { ForgotPasswordResponseDto } from './dtos/response/forgot-password.dto';
import { ResetPasswordQueryDto } from './dtos/query/reset-password.dto';
import { ResetPasswordBodyDto } from './dtos/body/reset-password.dto';
import { ResetPasswordResponseDto } from './dtos/response/reset-password.dto';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
  ) {}

  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: EmailLoginResponseDto,
    description: 'User info with access token',
  })
  async login(@Body() body: EmailLoginBodyDto) {
    const user = await this.authService.login({
      email: body.email,
      password: body.password,
    });
    console.log(user);
    const payload = {
      userId: user.id,
      role: isRole(body.role),
    };
    console.log(payload);
    const [access, refresh] = await Promise.all([
      this.tokenService.signAccessToken({ ...payload, type: TokenType.ACCESS }),
      this.tokenService.signRefreshToken({
        ...payload,
        type: TokenType.REFRESH,
      }),
    ]);

    return LoginMapper.toDomain(user, body.role, { access, refresh });
  }

  @Post('email/signup')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: EmailLoginResponseDto,
    description: 'User info',
  })
  async signup(@Body() body: EmailSignupBodyDto) {
    const { payload, user } = await this.authService.signup(body);
    const token = await this.tokenService.signConfirmEmailToken(payload);

    await this.mailService.userSignUp({
      to: payload.email,
      data: { hash: token.token },
    });

    return SignupMapper.toDomain(user, body.role);
  }

  @Get('email/verify')
  @Redirect()
  async verifyEmail(@Query() query: EmailVerifyQueryDto) {
    const { redirect } = this.apiConfigService.authConfig['confirm-email'];
    try {
      const payload = await this.tokenService.verifyConfirmEmailToken(
        query.token,
      );
      await this.authService.verifyEmail(payload.userId);
      return { url: redirect.success };
    } catch (error) {
      Logger.error(error);
      return { url: redirect.error };
    }
  }

  @Get('email/verify/success')
  verifyEmailSuccess() {
    return { message: 'Email Verified' };
  }

  @Get('email/verify/error')
  verifyEmailError() {
    return { message: 'Email Verification failed!' };
  }

  @Get('email/resend')
  async resendEmail(@Query() query: EmailResendQueryDto) {
    const payload = await this.authService.resendEmail(query.email);

    const token = await this.tokenService.signConfirmEmailToken(payload);

    await this.mailService.confirmNewEmail({
      to: payload.email,
      data: { hash: token.token },
    });

    return new EmailResendResponseDto(
      {},
      successMessage.AUTH.RESEND,
      HttpStatus.OK,
    );
  }

  @Post('/password/forgot')
  async forgotPassword(@Body() body: ForgotPasswordBodyDto) {
    const payload = await this.authService.forgotPassword(body.email);

    const token = await this.tokenService.signPasswordResetToken(payload);

    await this.mailService.forgotPassword({
      to: payload.email,
      data: { hash: token.token, tokenExpires: token.expiresIn },
    });

    return new ForgotPasswordResponseDto(
      {},
      successMessage.AUTH.FORGOT_PASSWORD,
      HttpStatus.OK,
    );
  }

  @Post('/password/reset')
  async resetPassword(
    @Query() query: ResetPasswordQueryDto,
    @Body() body: ResetPasswordBodyDto,
  ) {
    const payload = await this.tokenService.verifyPasswordResetToken(
      query.token,
    );

    await this.authService.resetPassword(payload.userId, body.password);

    return new ResetPasswordResponseDto(
      {},
      successMessage.AUTH.RESET_PASSWORD,
      HttpStatus.OK,
    );
  }
}
