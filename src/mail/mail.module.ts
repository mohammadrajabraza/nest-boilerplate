import { forwardRef, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { SharedModule } from '@/shared/shared.module';
import { ApiConfigService } from '@/shared/services/api-config.service';

@Module({
  imports: [forwardRef(() => SharedModule)],
  providers: [MailService, ApiConfigService],
  exports: [MailService],
})
export class MailModule {}
