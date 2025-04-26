import { ClassField } from '@/decorators/field.decorator';
import { PageMetaDto } from './page-meta.dto';

export class PageDto {
  @ClassField(() => PageMetaDto)
  public meta: PageMetaDto;

  constructor(meta: PageMetaDto) {
    this.meta = meta;
  }
}
