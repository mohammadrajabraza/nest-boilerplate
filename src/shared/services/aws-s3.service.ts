import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
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

  public getFileUrl(key: string) {
    // Return the public S3 URL for the object
    const bucket = this.configService.s3BucketName;
    const region = this.configService.awsConfig.region;
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
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
    const key = `attachments/${fileName}`;

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

  async uploadFileWithKey(
    file: Express.Multer.File,
    key: string,
  ): Promise<void> {
    if (!file || !file.mimetype || !file.buffer) {
      throw new Error('File, MIME type, or buffer is missing');
    }
    const contentType = file.mimetype;
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
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async getFileBuffer(key: string) {
    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.configService.s3BucketName,
          Key: key,
        }),
      );

      const fileBuffer = await streamToBuffer(response.Body as any);
      const contentType = response.ContentType || 'application/octet-stream';

      return { fileBuffer, contentType };
    } catch (error) {
      let message = 'File downloading failed!';
      if (error instanceof Error) {
        message = error.message;
      }
      throw new BadRequestException(message);
    }
  }

  async deleteFileWithKey(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.configService.s3BucketName,
          Key: key,
        }),
      );
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async listFilesWithPrefix(prefix: string): Promise<string[]> {
    try {
      const result = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: this.configService.s3BucketName,
          Prefix: prefix,
        }),
      );
      return (result.Contents || [])
        .map((obj) => obj.Key || '')
        .filter(Boolean);
    } catch (error) {
      throw new Error(`Failed to list files from S3: ${error.message}`);
    }
  }
}
