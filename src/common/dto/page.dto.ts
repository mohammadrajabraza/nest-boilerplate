import { ApiProperty } from '@nestjs/swagger';

import { ClassField } from '@/decorators/field.decorator';
import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  @ClassField(() => PageMetaDto)
  public meta: PageMetaDto;

  constructor(meta: PageMetaDto) {
    this.meta = meta;
  }
}
