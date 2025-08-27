import { AttachmentEntity } from '../entities/attachment.entity';
import { plainToInstance } from 'class-transformer';
import { AttachmentResponseDto } from '@/modules/attachments/dtos/response/attachment.dto';
import successMessage from '@/constants/success-message';
import { HttpStatus } from '@nestjs/common';
import { ListAttachmentDto } from '@/modules/attachments/dtos/response/list-attachment.dto';
import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import {
  IPageMetaDtoParameters,
  PageMetaDto,
} from '@/common/dto/page-meta.dto';

type AttachmentAction = 'UPLOAD' | 'LIST' | 'GET' | 'DELETE';

class AttachmentMapper {
  public static toDomain<
    TAction extends AttachmentAction,
    TOptions extends TAction extends 'LIST'
      ? IPageMetaDtoParameters
      : null = TAction extends 'LIST' ? IPageMetaDtoParameters : null,
  >(
    data: TAction extends 'LIST'
      ? AttachmentEntity[]
      : TAction extends 'DELETE'
        ? null
        : AttachmentEntity,
    action: TAction,
    options?: TOptions,
  ) {
    if (action === 'LIST' && data && Array.isArray(data) && options) {
      return new ListAttachmentDto(
        data.map((i) => i.toDto()),
        new PageMetaDto(options),
        successMessage.ATTACHMENT.LIST,
        HttpStatus.OK,
      );
    } else if (action === 'DELETE' && !data) {
      const DeleteResponse = BaseResponseMixin(class {});
      return new DeleteResponse(
        {},
        successMessage.ATTACHMENT.DELETE,
        HttpStatus.OK,
      );
    } else if (data && !Array.isArray(data)) {
      const response = new AttachmentResponseDto(
        data.toDto(),
        action === 'UPLOAD'
          ? successMessage.ATTACHMENT.UPLOAD
          : action === 'GET'
            ? successMessage.ATTACHMENT.GET
            : successMessage.ATTACHMENT.LIST,
        action === 'UPLOAD' ? HttpStatus.CREATED : HttpStatus.OK,
      );
      return response;
    }
    throw new Error('Invalid action');
  }

  public static toPersistence(
    attachmentData: any,
    attachment: AttachmentEntity | object = {},
  ) {
    return plainToInstance(AttachmentEntity, {
      ...attachment,
      ...attachmentData,
    });
  }
}

export default AttachmentMapper;
