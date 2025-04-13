import type { AbstractDto } from './common/dto/abstract.dto';
import type { LanguageCode } from './constants/language-code';
import { CreateTranslationDto } from './common/dto/create-translation.dto';
import { PageMetaDto } from './common/dto/page-meta.dto';
import { PageDto } from './common/dto/page.dto';

declare global {
  export type Uuid = string & { _uuidBrand: undefined };

  export type Todo = any & { _todoBrand: undefined };

  interface Array<T> {
    toDtos<Dto extends AbstractDto>(this: T[], options?: unknown): Dto[];

    getByLanguage(
      this: CreateTranslationDto[],
      languageCode: LanguageCode,
    ): string;

    toPageDto<Dto extends AbstractDto>(
      this: T[],
      pageMetaDto: PageMetaDto,
      // FIXME make option type visible from entity
      options?: unknown,
    ): PageDto<Dto>;
  }
}
