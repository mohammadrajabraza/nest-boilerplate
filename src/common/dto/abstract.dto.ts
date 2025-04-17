import { Uuid } from '@/types';
import { DateField, UUIDField } from '@/decorators/field.decorator';
import { DYNAMIC_TRANSLATION_DECORATOR_KEY } from '@/decorators/translate.decorator';
import { ContextProvider } from '@/providers/context.provider';
import type { AbstractEntity } from '../abstract.entity';
import { LanguageCode } from '@/constants/language-code';

export class AbstractDto {
  @UUIDField()
  id!: Uuid;

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;

  translations?: AbstractTranslationDto[];

  constructor(entity: AbstractEntity, options?: { excludeFields?: boolean }) {
    if (!options?.excludeFields) {
      this.id = entity.id;
      this.createdAt = entity.createdAt;
      this.updatedAt = entity.updatedAt;
    }
  }

  getTranslation(entity: AbstractEntity, key: string) {
    const languageCode = ContextProvider.getLanguage() || LanguageCode.en_US;

    if (languageCode && entity.translations) {
      const translationEntity = entity.translations.find(
        (titleTranslation) => titleTranslation.languageCode === languageCode,
      );

      if (translationEntity) {
        const metadata = Reflect.getMetadata(
          DYNAMIC_TRANSLATION_DECORATOR_KEY,
          this,
          key,
        );

        if (!metadata) return undefined;

        return translationEntity[key];
      }
    } else {
      this.translations = entity.translations?.map((t) => t.toDto());
    }
  }
}

export class AbstractTranslationDto extends AbstractDto {
  constructor(entity: AbstractEntity) {
    super(entity, { excludeFields: true });
  }
}
