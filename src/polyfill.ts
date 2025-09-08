import type { AbstractDto } from './common/dto/abstract.dto';
import type { LanguageCode } from './constants/language-code';
import type { CreateTranslationDto } from './common/dto/create-translation.dto';
import type { PageMetaDto } from './common/dto/page-meta.dto';
import type { PageDto } from './common/dto/page.dto';

declare global {
  export type Uuid = string & { _uuidBrand: undefined };

  export type Todo = any & { _todoBrand: undefined };

  interface Array<T> {
    toDtos<Dto extends AbstractDto>(this: T[], options?: unknown): Dto[];

    getByLanguage(this: CreateTranslationDto[], languageCode: LanguageCode): string;

    toPageDto(
      this: T[],
      pageMetaDto: PageMetaDto,
      // FIXME make option type visible from entity
      options?: unknown,
    ): PageDto;
  }
}
