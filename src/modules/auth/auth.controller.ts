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
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailLoginBodyDto } from './dtos/body/email-login.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { EmailLoginResponseDto } from './dtos/response/email-login.dto';
import { TokenService } from '../token/token.service';
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
import { CurrentUser } from '@/decorators/current-user.decorator';
import { UserDto } from '../users/dtos/user.dto';
import { GetMeResponseDto } from './dtos/response/get-me.dto';
import { Public } from '@/decorators/public.decorator';
import { RefreshGuard } from '@/guards/refresh.guard';
import { CurrentSession } from '@/decorators/current-session.decorator';
import { SessionDto } from './domain/session.dto';
import { RefreshTokenBody } from './dtos/body/refresh-token.dto';
import { RefreshTokenMapper } from './infrastructure/persistence/mapper/refresh.mapper';
import { CurrentToken } from '@/decorators/current-token.decorator';
import { TokenDto } from '../token/dtos/token.dto';
import { LogoutResponseDto } from './dtos/response/logout.dto';
import { UseAuthAuditInterceptor } from '@/interceptors/auth-audit.interceptor';
import { AuthAuditLogEvent } from '@/constants/auth-audit-log-event';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private mailService: MailService,
    private apiConfigService: ApiConfigService,
  ) {}

  @Public()
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.LOGIN_SUCCESS,
    error: AuthAuditLogEvent.LOGIN_FAILURE,
  })
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

    const payload = {
      userId: user.id,
      role: isRole(body.role),
    };

    const tokens = await this.authService.startSession(payload, {
      timeZone: body.timeZone,
      deviceToken: body.deviceToken,
    });

    return LoginMapper.toDomain(user, body.role, tokens);
  }

  @Public()
  @Post('email/signup')
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.SIGNUP_SUCCESS,
    error: AuthAuditLogEvent.SIGNUP_FAILURE,
  })
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

  @Public()
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

  @Public()
  @Get('email/verify/success')
  verifyEmailSuccess() {
    return { message: 'Email Verified' };
  }

  @Public()
  @Get('email/verify/error')
  verifyEmailError() {
    return { message: 'Email Verification failed!' };
  }

  @Public()
  @Get('email/resend')
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.EMAIL_RESEND_SUCCESS,
    error: AuthAuditLogEvent.EMAIL_RESEND_ERROR,
  })
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
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.FORGOT_PASSWORD_SUCCESS,
    error: AuthAuditLogEvent.FORGOT_PASSWORD_FAILURE,
  })
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
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.RESET_PASSWORD_SUCCESS,
    error: AuthAuditLogEvent.RESET_PASSWORD_FAILURE,
  })
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

  @Get('/me')
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.ME_SUCCESS,
    error: AuthAuditLogEvent.ME_FAILURE,
  })
  @HttpCode(HttpStatus.OK)
  getMe(@CurrentUser() user: UserDto) {
    return new GetMeResponseDto(
      user,
      successMessage.AUTH.GET_ME,
      HttpStatus.OK,
    );
  }

  @Public()
  @UseGuards(RefreshGuard)
  @Post('/refresh')
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.REFRESH_SUCCESS,
    error: AuthAuditLogEvent.REFRESH_FAILURE,
  })
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: RefreshTokenBody,
    @CurrentUser() user: UserDto,
    @CurrentSession() session: SessionDto,
    @CurrentToken() refreshToken: TokenDto,
  ) {
    const tokens = await this.authService.refreshSession(
      { userId: user.id, role: user.role },
      session,
      body,
    );

    await this.tokenService.revokeToken(refreshToken);

    return RefreshTokenMapper.toDomain(tokens);
  }

  @Get('/logout')
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.LOGOUT_SUCCESS,
    error: AuthAuditLogEvent.LOGOUT_FAILURE,
  })
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentSession() session: SessionDto) {
    await this.authService.logout(session);
    return new LogoutResponseDto({}, successMessage.AUTH.LOGOUT, HttpStatus.OK);
  }
}
