import { Column } from 'typeorm';
import { AbstractTranslationEntity } from '@/common/abstract.entity';
import { AbstractTranslationDto } from '@/common/dto/abstract.dto';

export class TestTranslationEntity extends AbstractTranslationEntity<AbstractTranslationDto> {
  @Column()
  title!: string;
}
