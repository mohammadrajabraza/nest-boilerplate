import { Column } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { AbstractDto } from '@/common/dto/abstract.dto';

export class TestEntity extends AbstractEntity<AbstractDto> {
  @Column()
  role!: string;
}
