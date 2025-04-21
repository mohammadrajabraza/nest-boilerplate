import { AwsS3Service } from '@/shared/services/aws-s3.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ImageService {
  constructor(private awsS3Service: AwsS3Service) {}
  async uploadImage(file: Express.Multer.File) {
    try {
      const fileName = await this.awsS3Service.uploadImage(file);
      return this.awsS3Service.getFileUrl(fileName);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async downloadImage(fileName: string) {
    const { fileBuffer, contentType } =
      await this.awsS3Service.getImageBuffer(fileName);
    return {
      data: fileBuffer,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    };
  }
}
