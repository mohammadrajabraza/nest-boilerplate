import { forwardRef, Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ApiConfigService } from '@/shared/services/api-config.service';
import { UserModule } from '@/modules/users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { UserService } from '../users/user.service';
import { SharedModule } from '@/shared/shared.module';
import { HashingService } from '@/shared/services/hashing.service';
import { RoleService } from '../roles/role.service';
import { RoleModule } from '../roles/role.module';
import { TokenService } from '../token/token.service';
import { TokenModule } from '../token/token.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '../roles/infrastructure/persistence/entities/role.entity';
import { TokenEntity } from '../token/infrastructure/persistence/entities/token.entity';
import { CompanyModule } from '../companies/company.module';
import { CompanyService } from '../companies/company.service';
import { CompanyEntity } from '../companies/infrastructure/persistence/entities/company.entity';
import { UserRoleEntity } from '../roles/infrastructure/persistence/entities/user-role.entity';
import { MailModule } from '@/mail/mail.module';
import { MailService } from '@/mail/mail.service';
import { ProfileSettingEntity } from '../users/infrastructure/persistence/entities/profile-setting.entity';
import { SessionEntity } from './infrastructure/persistence/entities/session.entity';
import { UserSubscriber } from './infrastructure/persistence/subscribers/user.subscriber';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.startegy';
import { AuthAuditLogModule } from '../auth-audit-logs/auth-audit-log.module';
import { AuthAuditLogService } from '../auth-audit-logs/auth-audit-log.service';
import { AuthAuditLogEntity } from '../auth-audit-logs/infrastructure/entities/auth-audit-log.entity';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      TokenEntity,
      CompanyEntity,
      UserRoleEntity,
      ProfileSettingEntity,
      SessionEntity,
      AuthAuditLogEntity,
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => RoleModule),
    forwardRef(() => TokenModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => AuthAuditLogModule),
    SharedModule,
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ApiConfigService): JwtModuleOptions => ({
        secret: configService.authConfig.access.secret,
        signOptions: {
          algorithm: configService.authConfig.algorithm,
          expiresIn: configService.authConfig.access.expiry,
        },
        verifyOptions: {
          algorithms: [configService.authConfig.algorithm],
        },
      }),
      inject: [ApiConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ApiConfigService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    GoogleOauthStrategy,
    UserService,
    AuthAuditLogService,
    RoleService,
    HashingService,
    TokenService,
    CompanyService,
    UserSubscriber,
    MailService,
    UserSubscriber,
  ],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
