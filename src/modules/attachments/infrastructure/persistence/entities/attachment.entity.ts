import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { AttachmentDto } from '../../../domain/attachment.dto';
import { Uuid } from '@/types';
import { UseDto } from '@/decorators/use-dto.decorator';

@Entity({ name: 'attachments' })
@UseDto(AttachmentDto)
@Index(['tenantId', 'entityType', 'entityId', 'category'])
@Index(['deletedAt'])
@Index(['fileName'])
@Index(['fileType'])
@Index(['uploadedById'])
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column({ type: 'varchar' })
  key: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'varchar' })
  fileName: string;

  @Column({ type: 'varchar' })
  fileType: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'uuid' })
  tenantId: Uuid;

  @Column({ type: 'varchar' })
  entityType: string;

  @Column({ type: 'uuid' })
  entityId: Uuid;

  @Column({ type: 'varchar' })
  category: string;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  uploadedAt: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt: Date | null;

  @Column({ type: 'uuid', nullable: true, default: null })
  uploadedById?: Uuid | null;

  @Column({ type: 'uuid', nullable: true, default: null })
  deletedById?: Uuid | null;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: UserEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'deleted_by_id' })
  deletedBy: UserEntity | null;

  toDto(): AttachmentDto {
    return new AttachmentDto(this);
  }
}
