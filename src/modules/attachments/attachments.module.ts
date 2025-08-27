import { SharedModule } from '@/shared/shared.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { DocumentValidationPipe } from './pipes/document-validation.pipe';
import { ImageValidationPipe } from './pipes/image-validation.pipe';
import { AttachmentEntity } from './infrastructure/persistence/entities/attachment.entity';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([AttachmentEntity])],
  controllers: [AttachmentsController],
  providers: [AttachmentsService, DocumentValidationPipe, ImageValidationPipe],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
