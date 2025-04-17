import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { SharedModule } from '@/shared/shared.module';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './infrastructure/persistence/entities/token.entity';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([TokenEntity])],
  providers: [TokenService, JwtService, ApiConfigService],
  exports: [TokenService],
})
export class TokenModule {}
