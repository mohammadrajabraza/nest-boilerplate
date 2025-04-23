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
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailLoginBodyDto } from './dtos/body/email-login.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeaders,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
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
import { GetMeResponseDto } from './dtos/response/get-me.dto';
import { Public } from '@/decorators/public.decorator';
import { RefreshGuard } from '@/guards/refresh.guard';
import { CurrentSession } from '@/decorators/current-session.decorator';
import { SessionDto } from './domain/session.dto';
import { RefreshTokenBody } from './dtos/body/refresh-token.dto';
import { RefreshTokenMapper } from './infrastructure/persistence/mapper/refresh.mapper';
import { CurrentToken } from '@/decorators/current-token.decorator';
import { TokenDto } from '../token/domain/token.dto';
import { LogoutResponseDto } from './dtos/response/logout.dto';
import { UseAuthAuditInterceptor } from '@/interceptors/auth-audit.interceptor';
import { AuthAuditLogEvent } from '@/constants/auth-audit-log-event';
import { GoogleOAuthGuard } from '@/guards/google-oauth.guard';
import { SocialRequest } from '@/types/jwt';
import { UserService } from '../users/user.service';
import { RoleType } from '@/constants/role-type';
import { Roles } from '@/decorators/role.decorator';
import { EmailSignupResponseDto } from './dtos/response/email-signup.dto';
import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { RefreshTokenResponseDto } from './dtos/response/refresh-token.dto';
import { UserDto } from '../users/domain/user.dto';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private userService: UserService,
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
  @ApiBody({ type: EmailLoginBodyDto })
  async login(@Body() body: EmailLoginBodyDto) {
    const { user, isPasswordReset } = await this.authService.login({
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

    return LoginMapper.toDomain(user, body.role, tokens, isPasswordReset);
  }

  @Public()
  @Post('email/signup')
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.SIGNUP_SUCCESS,
    error: AuthAuditLogEvent.SIGNUP_FAILURE,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: EmailSignupResponseDto,
    description: 'User info',
  })
  @ApiBody({ type: EmailSignupBodyDto })
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
  @ApiResponse({
    status: HttpStatus.PERMANENT_REDIRECT,
  })
  @ApiQuery({ name: 'token', type: String })
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
  @HttpCode(HttpStatus.OK)
  @Get('email/verify/success')
  @ApiOkResponse({
    type: BaseResponseMixin(class {}),
  })
  verifyEmailSuccess() {
    return new (BaseResponseMixin(class {}))(
      {},
      'Email verified',
      HttpStatus.OK,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: BaseResponseMixin(class {}),
  })
  @Get('email/verify/error')
  verifyEmailError() {
    return new (BaseResponseMixin(class {}))(
      {},
      'Email Verification failed!',
      HttpStatus.OK,
    );
  }

  @Public()
  @Get('email/resend')
  @HttpCode(HttpStatus.OK)
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.EMAIL_RESEND_SUCCESS,
    error: AuthAuditLogEvent.EMAIL_RESEND_ERROR,
  })
  @ApiOkResponse({
    type: EmailResendResponseDto,
  })
  @ApiQuery({ name: 'email', type: String })
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
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.FORGOT_PASSWORD_SUCCESS,
    error: AuthAuditLogEvent.FORGOT_PASSWORD_FAILURE,
  })
  @ApiOkResponse({
    type: ForgotPasswordResponseDto,
  })
  @ApiBody({ type: ForgotPasswordBodyDto })
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
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.RESET_PASSWORD_SUCCESS,
    error: AuthAuditLogEvent.RESET_PASSWORD_FAILURE,
  })
  @ApiOkResponse({
    type: ResetPasswordResponseDto,
  })
  @ApiQuery({ name: 'token', type: String })
  @ApiBody({ type: ResetPasswordBodyDto })
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
  @Roles(RoleType.USER, RoleType.ADMIN)
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.ME_SUCCESS,
    error: AuthAuditLogEvent.ME_FAILURE,
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: GetMeResponseDto,
  })
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
  @ApiBody({ type: RefreshTokenBody })
  @ApiHeaders([
    {
      name: 'x-refresh-token',
      required: true,
      description: 'Refresh token',
      example: 'abcd',
    },
  ])
  @ApiOkResponse({ type: RefreshTokenResponseDto })
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
  @ApiBearerAuth()
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.LOGOUT_SUCCESS,
    error: AuthAuditLogEvent.LOGOUT_FAILURE,
  })
  @ApiOkResponse({ type: LogoutResponseDto })
  @Roles(RoleType.USER, RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentSession() session: SessionDto) {
    await this.authService.logout(session);
    return new LogoutResponseDto({}, successMessage.AUTH.LOGOUT, HttpStatus.OK);
  }

  @Get('/google')
  @Public()
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.LOGOUT_SUCCESS,
    error: AuthAuditLogEvent.LOGOUT_FAILURE,
  })
  @UseGuards(GoogleOAuthGuard)
  @HttpCode(HttpStatus.OK)
  googleAuth() {
    console.log('Google auth route hit');
  }

  @Get('/google/callback')
  @Public()
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.LOGOUT_SUCCESS,
    error: AuthAuditLogEvent.LOGOUT_FAILURE,
  })
  @UseGuards(GoogleOAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Redirect()
  @ApiResponse({
    status: HttpStatus.PERMANENT_REDIRECT,
  })
  async googleAuthCallback(@Req() req: SocialRequest<'google'>) {
    const redirectConfig = this.apiConfigService.googleRedirect;
    try {
      const user = await this.authService.googleAuth(req.user);
      const tokens = await this.authService.startSession(
        {
          userId: user.id,
          role: isRole(user.userRoles[0].role.name),
        },
        { deviceToken: null, timeZone: null },
      );
      const url = new URL(redirectConfig.success);
      url.searchParams.set('access', encodeURIComponent(tokens.access.token));
      url.searchParams.set('refresh', encodeURIComponent(tokens.refresh.token));
      return { url: url.toString() };
    } catch (error) {
      Logger.error(error);
      const url = new URL(redirectConfig.error);
      url.searchParams.set('error', error.message);
      return { url: url.toString() };
    }
  }

  @Get('/google/success')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'access', type: String })
  @ApiQuery({ name: 'refresh', type: String })
  @ApiOkResponse({})
  async googleSuccess(
    @Query('access') accessToken: string,
    @Query('refresh') refreshToken: string,
  ) {
    const session = await this.authService.checkSession({
      accessToken,
      refreshToken,
    });
    const user = await this.userService.findOne({ id: session.userId as Uuid });

    return {
      user: user.toDto({ role: RoleType.USER }),
      session: session.toDto(),
    };
  }

  @Get('/google/error')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'error', type: String })
  googleError(@Query('error') error: string) {
    return { message: error };
  }
}
