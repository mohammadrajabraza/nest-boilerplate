import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from '../roles/role.module';
import { RoleService } from '../roles/role.service';
import { SharedModule } from '@/shared/shared.module';
import { HashingService } from '@/shared/services/hashing.service';
import { UserSubscriber } from '../auth/infrastructure/persistence/subscribers/user.subscriber';
import { MailService } from '@/mail/mail.service';
import { TokenService } from '../token/token.service';
import { GeneratorService } from '@/shared/services/generator.service';
import { JwtService } from '@nestjs/jwt';
import entities from '@/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature(entities), forwardRef(() => SharedModule), forwardRef(() => RoleModule)],
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
