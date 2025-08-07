import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { AbstractDto, AbstractTranslationDto } from './dto/abstract.dto';
import { Uuid } from '@/types';
import { LanguageCode } from '@/constants/language-code';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';

/**
 * Abstract Entity
 * @author Narek Hakobyan <narek.hakobyan.07@gmail.com>
 *
 * @description This class is an abstract class for all entities.
 * It's experimental and recommended using it only in microservice architecture,
 * otherwise just delete and use your own entity.
 */
export abstract class AbstractEntity<
  DTO extends AbstractDto = AbstractDto,
  O = never,
> {
  @PrimaryGeneratedColumn('uuid')
  id!: Uuid;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP', // Initial default for updates
    onUpdate: 'CURRENT_TIMESTAMP', // Update to current timestamp
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt!: Date;

  @Column({ type: 'uuid', nullable: true, default: null })
  createdById?: Uuid | null;

  @Column({ type: 'uuid', nullable: true, default: null })
  updatedById?: Uuid | null;

  @Column({ type: 'uuid', nullable: true, default: null })
  deletedById?: Uuid | null;

  @JoinColumn({ name: 'created_by_id', referencedColumnName: 'id' })
  @ManyToOne('UserEntity')
  createdBy: UserEntity | null;

  @JoinColumn({ name: 'updated_by_id', referencedColumnName: 'id' })
  @ManyToOne('UserEntity')
  updatedBy: UserEntity | null;

  @JoinColumn({ name: 'deleted_by_id', referencedColumnName: 'id' })
  @ManyToOne('UserEntity')
  deletedBy: UserEntity | null;

  translations?: AbstractTranslationEntity[];

  toDto(options?: O): DTO {
    const dtoClass = Object.getPrototypeOf(this).dtoClass;

    if (!dtoClass) {
      throw new Error(
        `You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`,
      );
    }

    return new dtoClass(this, options);
  }
}

export class AbstractTranslationEntity<
  DTO extends AbstractTranslationDto = AbstractTranslationDto,
  O = never,
> extends AbstractEntity<DTO, O> {
  @Column({ type: 'enum', enum: LanguageCode })
  languageCode!: LanguageCode;
}
