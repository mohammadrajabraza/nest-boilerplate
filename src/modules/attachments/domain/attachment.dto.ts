import {
  ClassFieldOptional,
  StringFieldOptional,
  NumberFieldOptional,
  UUIDFieldOptional,
  DateFieldOptional,
} from '@/decorators/field.decorator';
import type { AttachmentEntity } from '../infrastructure/persistence/entities/attachment.entity';
import { UserDto } from '@/modules/users/domain/user.dto';
import { Uuid } from '@/types';

export class AttachmentDto {
  @UUIDFieldOptional({ nullable: false })
  public id: Uuid;

  @StringFieldOptional({ nullable: false })
  public key: string;

  @StringFieldOptional({ nullable: false })
  public url: string;

  @StringFieldOptional({ nullable: false })
  public fileName: string;

  @StringFieldOptional({ nullable: false })
  public fileType: string;

  @NumberFieldOptional({ nullable: false })
  public size: number;

  @DateFieldOptional({ nullable: false })
  public uploadedAt: Date;

  @UUIDFieldOptional({ nullable: false })
  public tenantId: Uuid;

  @StringFieldOptional({ nullable: false })
  public entityType: string;

  @UUIDFieldOptional({ nullable: false })
  public entityId: Uuid;

  @StringFieldOptional({ nullable: false })
  public category: string;

  @ClassFieldOptional(() => UserDto, { nullable: true })
  public uploadedBy?: UserDto;

  @UUIDFieldOptional({ nullable: true })
  public uploadedById?: Uuid | null;

  @ClassFieldOptional(() => UserDto, { nullable: true })
  public deletedBy?: UserDto;

  @UUIDFieldOptional({ nullable: true })
  public deletedById?: Uuid | null;

  @DateFieldOptional({ nullable: true })
  public deletedAt?: Date | null;

  constructor(attachment: AttachmentEntity) {
    this.id = attachment.id;
    this.key = attachment.key;
    this.url = attachment.url;
    this.fileName = attachment.fileName;
    this.fileType = attachment.fileType;
    this.size = attachment.size;
    this.uploadedAt = attachment.uploadedAt;
    this.tenantId = attachment.tenantId;
    this.entityType = attachment.entityType;
    this.entityId = attachment.entityId;
    this.category = attachment.category;
    this.uploadedById = attachment.uploadedById;
    this.deletedById = attachment.deletedById;

    // Only try to create UserDto if the user relation is fully loaded
    if (attachment.uploadedBy && attachment.uploadedBy.userRoles) {
      try {
        this.uploadedBy = attachment.uploadedBy.toDto();
      } catch (error) {
        // If UserDto creation fails, just skip it
        console.log(error);
        this.uploadedBy = undefined;
      }
    }

    if (attachment.deletedBy && attachment.deletedBy.userRoles) {
      try {
        this.deletedBy = attachment.deletedBy.toDto();
      } catch (error) {
        console.log(error);
        // If UserDto creation fails, just skip it
        this.deletedBy = undefined;
      }
    }

    this.deletedAt = attachment.deletedAt;
  }
}
