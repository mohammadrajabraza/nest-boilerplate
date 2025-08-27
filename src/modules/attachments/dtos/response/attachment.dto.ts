import { BaseResponseMixin } from '@/common/dto/base-response.dto';
import { AttachmentDto } from '../../domain/attachment.dto';

export class AttachmentResponseDto extends BaseResponseMixin(AttachmentDto) {}
