import type { Provider } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ApiConfigService } from './services/api-config.service';
import { TranslationService } from './services/translation.service';
import { HashingService } from './services/hashing.service';

const providers: Provider[] = [
  ApiConfigService,
  TranslationService,
  HashingService,
];

@Global()
@Module({
  providers,
  imports: [CqrsModule],
  exports: [...providers, CqrsModule],
})
export class SharedModule {}
