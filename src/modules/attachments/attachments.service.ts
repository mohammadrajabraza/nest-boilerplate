import { AwsS3Service } from '@/shared/services/aws-s3.service';
import { Injectable } from '@nestjs/common';
import ErrorMessage from '@/constants/error-message';
import { AttachmentEntity } from './infrastructure/persistence/entities/attachment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Readable } from 'stream';
import { Uuid } from '@/types';
import { AttachmentQueryDto } from './dtos/query/attachment-query.dto';

interface UploadHierarchicalParams {
  file: Express.Multer.File;
  entityType: string;
  entityId: Uuid;
  category: string;
  fileType: string; // 'image' | 'document' | etc.
  fileName?: string;
}

@Injectable()
export class AttachmentsService {
  constructor(
    private awsS3Service: AwsS3Service,
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
  ) {}

  async uploadHierarchical({
    file,
    entityType,
    entityId,
    category,
    fileType,
    fileName,
    uploadedById,
  }: UploadHierarchicalParams & { uploadedById: Uuid }): Promise<{
    id: string;
    url: string;
  }> {
    if (!file) {
      throw new Error(ErrorMessage.ATTACHMENT.NO_FILE);
    }
    let finalFileName = fileName?.replace(/ /g, '_');
    if (!finalFileName) {
      const fileExtension = file.originalname.split('.').pop();
      finalFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExtension}`;
    }
    const key = `${entityType}/${entityId}/${category}/${finalFileName}`;
    try {
      await this.awsS3Service.uploadFileWithKey(file, key);
      const url = this.awsS3Service.getFileUrl(key);
      const attachment = this.attachmentRepository.create({
        key,
        url,
        fileName: finalFileName,
        fileType,
        size: file.size,
        entityType,
        entityId,
        category,
        uploadedBy: { id: uploadedById },
      });
      const saved = await this.attachmentRepository.save(attachment);
      return { id: saved.id, url };
    } catch (error) {
      throw new Error(
        ErrorMessage.ATTACHMENT.UPLOAD_FAILED + ': ' + error.message,
      );
    }
  }

  async listHierarchical(
    options: AttachmentQueryDto,
  ): Promise<AttachmentEntity[]> {
    try {
      const query = this.attachmentRepository
        .createQueryBuilder('attachment')
        .andWhere('attachment.entityType = :entityType', {
          entityType: options.entityType,
        })
        .andWhere('attachment.entityId = :entityId', {
          entityId: options.entityId,
        })
        .andWhere('attachment.category = :category', {
          category: options.category,
        })
        .andWhere('attachment.deletedAt IS NULL'); // Only non-deleted attachments

      // Add search functionality
      if (options.q && typeof options.q === 'string') {
        query.andWhere(
          '(attachment.fileName LIKE :q OR attachment.fileType LIKE :q)',
          { q: `%${options.q}%` },
        );
      }

      // Add pagination
      if (typeof options.skip === 'number') {
        query.skip(options.skip);
      }

      if (typeof options.take === 'number') {
        query.take(options.take);
      }

      // Add sorting
      if (options.order) {
        query.orderBy(
          'attachment.uploadedAt',
          options.order.toUpperCase() as 'ASC' | 'DESC',
        );
      } else {
        query.orderBy('attachment.uploadedAt', 'DESC'); // Default to newest first
      }

      const attachments = await query.getMany();
      return attachments;
    } catch (error) {
      throw new Error(
        ErrorMessage.ATTACHMENT.LIST_FAILED + ': ' + error.message,
      );
    }
  }

  async countAttachments(options: AttachmentQueryDto): Promise<number> {
    try {
      const query = this.attachmentRepository
        .createQueryBuilder('attachment')
        .andWhere('attachment.entityType = :entityType', {
          entityType: options.entityType,
        })
        .andWhere('attachment.entityId = :entityId', {
          entityId: options.entityId,
        })
        .andWhere('attachment.category = :category', {
          category: options.category,
        })
        .andWhere('attachment.deletedAt IS NULL');

      // Add search functionality
      if (options.q && typeof options.q === 'string') {
        query.andWhere(
          '(attachment.fileName LIKE :q OR attachment.fileType LIKE :q)',
          { q: `%${options.q}%` },
        );
      }

      const count = await query.getCount();
      return count;
    } catch (error) {
      throw new Error(
        ErrorMessage.ATTACHMENT.LIST_FAILED + ': ' + error.message,
      );
    }
  }

  async downloadById(
    id: Uuid,
  ): Promise<{ stream: Readable; fileName: string; mimeType: string }> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
    });
    if (!attachment) {
      throw new Error(ErrorMessage.ATTACHMENT.NOT_FOUND);
    }
    // TODO: Add permission check here
    const { fileBuffer, contentType } = await this.awsS3Service.getFileBuffer(
      attachment.key,
    );
    const stream = Readable.from(fileBuffer);
    return { stream, fileName: attachment.fileName, mimeType: contentType };
  }

  async deleteById(id: string, deleteById: Uuid): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: id as Uuid },
    });
    if (!attachment) {
      throw new Error(ErrorMessage.ATTACHMENT.NOT_FOUND);
    }
    // TODO: Add permission check here
    await this.awsS3Service.deleteFileWithKey(attachment.key);
    await this.attachmentRepository.update(id, {
      deletedById: deleteById,
      deletedAt: new Date(),
    });
  }

  async getAttachmentsForEntity(
    entityType: string,
    entityId: Uuid,
  ): Promise<AttachmentEntity[]> {
    try {
      const attachments = await this.attachmentRepository.find({
        where: {
          entityType,
          entityId,
          deletedAt: IsNull(),
        },
        order: {
          uploadedAt: 'ASC',
        },
      });
      return attachments;
    } catch (error) {
      throw new Error(
        ErrorMessage.ATTACHMENT.LIST_FAILED + ': ' + error.message,
      );
    }
  }
}
