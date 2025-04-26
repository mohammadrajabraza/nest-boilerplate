import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { SharedModule } from '@/shared/shared.module';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from '@/database/entities';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature(entities)],
  providers: [TokenService, JwtService, ApiConfigService],
  exports: [TokenService],
})
export class TokenModule {}
