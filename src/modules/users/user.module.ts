import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { RoleModule } from '../roles/role.module';
import { RoleService } from '../roles/role.service';
import { RoleEntity } from '../roles/infrastructure/persistence/entities/role.entity';
import { SharedModule } from '@/shared/shared.module';
import { HashingService } from '@/shared/services/hashing.service';
import { UserRoleEntity } from '../roles/infrastructure/persistence/entities/user-role.entity';
import { ProfileSettingEntity } from './infrastructure/persistence/entities/profile-setting.entity';
import { UserSubscriber } from '../auth/infrastructure/persistence/subscribers/user.subscriber';
import { MailService } from '@/mail/mail.service';
import { TokenService } from '../token/token.service';
import { GeneratorService } from '@/shared/services/generator.service';
import { JwtService } from '@nestjs/jwt';
import { TokenEntity } from '../token/infrastructure/persistence/entities/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      UserRoleEntity,
      ProfileSettingEntity,
      TokenEntity,
    ]),
    forwardRef(() => SharedModule),
    forwardRef(() => RoleModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    RoleService,
    UserSubscriber,
    HashingService,
    MailService,
    TokenService,
    GeneratorService,
    JwtService,
  ],
  exports: [UserService],
})
export class UserModule {}
