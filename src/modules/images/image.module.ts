import { AwsS3Service } from '@/shared/services/aws-s3.service';
import { SharedModule } from '@/shared/shared.module';
import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { GeneratorService } from '@/shared/services/generator.service';
import { ImageUploadPipe } from './pipes/image-upload.pipe';

@Module({
  imports: [SharedModule],
  controllers: [ImageController],
  providers: [
    ImageService,
    AwsS3Service,
    ApiConfigService,
    GeneratorService,
    ImageUploadPipe,
  ],
  exports: [ImageService],
})
export class ImageModule {}
