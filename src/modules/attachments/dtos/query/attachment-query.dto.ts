import {
  EnumFieldOptional,
  StringFieldOptional,
  UUIDFieldOptional,
} from '@/decorators/field.decorator';
import { Uuid } from '@/types';
import { PageOptionsDto } from '@/common/dto/page-options.dto';
import { AttachmentCategory, AttachmentEntityType } from '../body/create-attachment.dto';

export class AttachmentQueryDto extends PageOptionsDto {
  @UUIDFieldOptional({
    description:
      'Tenant ID. The unique identifier for the tenant who owns the attachment. Example: tenantId=123',
    example: '123e4567-e89b-12d3-a456-426614174000',
    swagger: true,
  })
  tenantId?: Uuid;

  @EnumFieldOptional(() => AttachmentEntityType)
  entityType?: AttachmentEntityType;

  @UUIDFieldOptional({
    description:
      'Entity ID. The unique identifier for the entity (e.g., user ID, product ID). Can be omitted for new entities.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    swagger: true,
  })
  entityId?: Uuid;

  @EnumFieldOptional(() => AttachmentCategory)
  category?: AttachmentCategory;

  @StringFieldOptional({
    description:
      'File name (for upload or delete). Optional for upload; required for delete. Example: fileName=avatar.jpg',
    swagger: true,
  })
  fileName?: string;
}
