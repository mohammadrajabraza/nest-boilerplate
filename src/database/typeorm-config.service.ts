import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ApiConfigService } from '@/shared/services/api-config.service';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private apiConfigSerivce: ApiConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...this.apiConfigSerivce.postgresConfig,
      extra: this.apiConfigSerivce.extraPostgresConfig,
    } as TypeOrmModuleOptions;
  }
}
