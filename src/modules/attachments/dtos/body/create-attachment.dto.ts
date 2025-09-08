import { EnumField, StringFieldOptional, UUIDField } from '@/decorators/field.decorator';
import { Uuid } from '@/types';

export enum AttachmentEntityType {
  USER = 'user',
  COMPANY = 'company',
}

export enum AttachmentCategory {
  USER_PROFILE = 'user_profile',
}

export class CreateAttachmentBodyDto {
  @UUIDField({
    description: 'Tenant ID. The unique identifier for the tenant who owns the attachment. Example: tenantId=123',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  tenantId: Uuid;

  @EnumField(() => AttachmentEntityType)
  entityType: AttachmentEntityType;

  @UUIDField({
    description:
      'Entity ID. The unique identifier for the entity (e.g., user ID, product ID). Can be omitted for new entities.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  entityId: Uuid;

  @EnumField(() => AttachmentCategory)
  category: AttachmentCategory;

  @StringFieldOptional({
    description:
      'File name (for upload or delete). Optional for upload; required for delete. Example: fileName=avatar.jpg',
  })
  fileName?: string;
}
