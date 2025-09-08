import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import type { TranslateOptions } from 'nestjs-i18n';
import { I18nService } from 'nestjs-i18n';
import { AbstractDto } from '@/common/dto/abstract.dto';
import { STATIC_TRANSLATION_DECORATOR_KEY } from '@/decorators/translate.decorator';
import type { ITranslationDecoratorInterface } from '@/interfaces/ITranslationDecorator';
import { ContextProvider } from '@/providers/context.provider';
import { LanguageCode } from '@/constants/language-code';

@Injectable()
export class TranslationService {
  constructor(private readonly i18n: I18nService) {}

  async translate(key: string, options?: TranslateOptions): Promise<string> {
    const lang = ContextProvider.getLanguage() || LanguageCode.en_US;
    const result = await this.i18n.translate(key, { ...options, lang });
    if (result === key) {
    }
    return result as string;
  }

  async translateNecessaryKeys<T extends AbstractDto>(dto: T): Promise<T> {
    await Promise.all(
      _.map(dto, async (value, key) => {
        if (_.isString(value)) {
          const translateDec: ITranslationDecoratorInterface | undefined = Reflect.getMetadata(
            STATIC_TRANSLATION_DECORATOR_KEY,
            dto,
            key,
          );
          if (translateDec) {
            const translated = await this.translate(`${translateDec.translationKey ?? key}.${value}`);
            dto[key] = translated;
          }
          return;
        }
        if (value instanceof AbstractDto) {
          return this.translateNecessaryKeys(value);
        }
        if (Array.isArray(value)) {
          return Promise.all(
            _.map(value, (v) => {
              if (v instanceof AbstractDto) {
                return this.translateNecessaryKeys(v);
              }
              return null;
            }),
          );
        }
        return null;
      }),
    );
    return dto;
  }
}
