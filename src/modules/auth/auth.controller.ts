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
  ApiOperation,
  ApiTags,
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
import { ChangePasswordResponseDto } from './dtos/response/change-password.dto';
import { ChangePasswordBodyDto } from './dtos/body/change-password.dto';
import { TerminateUserSessionsBodyDto } from './dtos/body/terminate-user-sessions.dto';
import { TerminateUserSessionsResponseDto } from './dtos/response/terminate-user-sessions.dto';

@ApiTags('Authentication')
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
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password, returns user info with access token',
  })
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
  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user account and send confirmation email',
  })
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

    return SignupMapper.toDomain(user, RoleType.USER);
  }

  @Public()
  @Get('email/verify')
  @Redirect()
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verify user email address using confirmation token',
  })
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

      const { userProfileSetting } = await this.authService.verifyEmail(
        payload.userId,
      );
      if (!userProfileSetting.isPasswordReset) {
        return { url: redirect['password-reset'] };
      }
      return { url: redirect.success };
    } catch (error) {
      Logger.error(error);
      return { url: redirect.error };
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('email/verify/success')
  @ApiOperation({
    summary: 'Email verification success page',
    description: 'Success page shown after email verification',
  })
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
  @ApiOperation({
    summary: 'Email verification error page',
    description: 'Error page shown when email verification fails',
  })
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
  @ApiOperation({
    summary: 'Resend confirmation email',
    description: 'Resend email confirmation link to user',
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
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Send password reset email to user',
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
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using reset token',
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

    await this.authService.resetPassword(
      payload.userId,
      body.password,
      body.shouldLogoutAllSessions,
    );

    return new ResetPasswordResponseDto(
      {},
      successMessage.AUTH.RESET_PASSWORD,
      HttpStatus.OK,
    );
  }

  @Post('/password/change')
  @Roles(RoleType.ADMIN, RoleType.USER)
  @HttpCode(HttpStatus.OK)
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.CHANGE_PASSWORD_SUCCESS,
    error: AuthAuditLogEvent.CHANGE_PASSWORD_FAILURE,
  })
  @ApiOperation({
    summary: 'Change password',
    description: 'Change user password (requires authentication)',
  })
  @ApiOkResponse({
    type: ChangePasswordResponseDto,
  })
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordBodyDto })
  async changePassword(
    @Body() body: ChangePasswordBodyDto,
    @CurrentUser() user: UserDto,
  ) {
    await this.authService.changePassword(
      user.id,
      body.password,
      body.shouldLogoutAllSessions,
    );
    return new ChangePasswordResponseDto(
      {},
      successMessage.AUTH.CHANGE_PASSWORD,
      HttpStatus.OK,
    );
  }

  @Get('/me')
  @Roles(RoleType.ADMIN, RoleType.USER)
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.ME_SUCCESS,
    error: AuthAuditLogEvent.ME_FAILURE,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get current authenticated user information',
  })
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
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refresh access token using refresh token',
  })
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
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout current user and invalidate session',
  })
  @ApiOkResponse({ type: LogoutResponseDto })
  @Roles(RoleType.ADMIN, RoleType.USER)
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
  @ApiOperation({
    summary: 'Google OAuth login',
    description: 'Initiate Google OAuth authentication flow',
  })
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
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handle Google OAuth callback and redirect with tokens',
  })
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
        { deviceToken: undefined, timeZone: undefined },
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
  @ApiOperation({
    summary: 'Google OAuth success',
    description: 'Handle successful Google OAuth authentication',
  })
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
  @ApiOperation({
    summary: 'Google OAuth error',
    description: 'Handle Google OAuth authentication errors',
  })
  @ApiQuery({ name: 'error', type: String })
  googleError(@Query('error') error: string) {
    return { message: error };
  }

  @Post('/terminate-user-sessions')
  @Roles(RoleType.ADMIN)
  @UseAuthAuditInterceptor({
    success: AuthAuditLogEvent.LOGOUT_SUCCESS,
    error: AuthAuditLogEvent.LOGOUT_FAILURE,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Terminate all sessions for a user (Admin only)',
    description:
      'Terminate all active sessions for a specific user. Only admins can use this endpoint.',
  })
  @ApiOkResponse({
    type: TerminateUserSessionsResponseDto,
  })
  @ApiBearerAuth()
  @ApiBody({ type: TerminateUserSessionsBodyDto })
  async terminateUserSessions(
    @Body() body: TerminateUserSessionsBodyDto,
    // @CurrentUser() adminUser: UserDto,
  ) {
    await this.authService.terminateAllUserSessions(body.userId as Uuid);
    return new TerminateUserSessionsResponseDto(
      {},
      successMessage.AUTH.TERMINATE_USER_SESSIONS,
      HttpStatus.OK,
    );
  }
}
