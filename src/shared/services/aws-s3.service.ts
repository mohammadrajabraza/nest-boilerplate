import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import mime from 'mime-types';

import type { IFile } from '@/interfaces/IFile';
import { ApiConfigService } from './api-config.service';
import { GeneratorService } from './generator.service';
import streamToBuffer from '@/utils/stream-to-buffer';

@Injectable()
export class AwsS3Service {
  private readonly s3: S3Client;

  constructor(
    public configService: ApiConfigService,
    public generatorService: GeneratorService,
  ) {
    const config = configService.awsConfig;

    this.s3 = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  public getFileUrl(fileName: string) {
    return `${this.configService.backendDomain}/api/v1/images/download/${fileName}`;
  }

  async uploadImage(file: IFile): Promise<string> {
    // Validate file, mimetype, and size
    if (!file || !file.mimetype || !file.buffer) {
      throw new Error('File, MIME type, or buffer is missing');
    }

    const fileExtension = mime.extension(file.mimetype);
    if (!fileExtension) {
      throw new Error(`Invalid MIME type: ${file.mimetype}`);
    }

    const fileName = this.generatorService.fileName(fileExtension);
    const key = `images/${fileName}`;

    // Derive ContentType with fallback
    const contentType =
      file.mimetype || mime.lookup(fileName) || 'application/octet-stream';

    // Use file.size for ContentLength (size in bytes)
    const contentLength = file.size || file.buffer.length;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.configService.s3BucketName,
          Body: file.buffer,
          Key: key,
          ContentType: contentType,
          ContentLength: contentLength,
        }),
      );
      return fileName;
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async getImageBuffer(fileName: string) {
    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.configService.s3BucketName,
          Key: `images/${fileName}`,
        }),
      );

      const fileBuffer = await streamToBuffer(response.Body as any);
      const contentType = response.ContentType || 'application/octet-stream';

      return { fileBuffer, contentType };
    } catch (error) {
      let message = 'Image downloading failed!';
      if (error instanceof Error) {
        message = error.message;
      }
      throw new InternalServerErrorException(message);
    }
  }
}
