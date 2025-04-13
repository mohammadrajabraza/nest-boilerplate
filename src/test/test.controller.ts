import { Controller, Get } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { TranslationService } from '@/shared/services/translation.service';
import { AbstractDto } from '@/common/dto/abstract.dto';
import {
  StaticTranslate,
  DynamicTranslate,
} from '@/decorators/translate.decorator';
import { LanguageCode } from '@/constants/language-code';
import { UseLanguageInterceptor } from '@/interceptors/language.interceptor';
import type { Uuid } from '@/types';
import { TestEntity } from './test.entity';
import { TestTranslationEntity } from './test-translation.entity';

@Controller('test')
@UseLanguageInterceptor()
export class TestController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('hello')
  async getHello(@I18n() i18n: I18nContext) {
    const direct = await i18n.t('messages.hello');
    const viaService =
      await this.translationService.translate('messages.hello');
    return {
      direct,
      viaService,
    };
  }

  @Get('dto')
  getDto() {
    const translations: TestTranslationEntity[] = [
      {
        id: 'trans1' as Uuid,
        languageCode: LanguageCode.en_US,
        title: 'Title',
        createdAt: new Date(),
        updatedAt: new Date(),
        toDto: () => new AbstractDto(this as any),
      },
      {
        id: 'trans2' as Uuid,
        languageCode: LanguageCode.ru_RU,
        title: 'Заголовок',
        createdAt: new Date(),
        updatedAt: new Date(),
        toDto: () => new AbstractDto(this as any),
      },
    ];

    const mockEntity: TestEntity = {
      id: '123e4567-e89b-12d3-a456-426614174000' as Uuid,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'admin',
      translations,
      toDto: () => new AbstractDto(this as any),
    };

    class TestDto extends AbstractDto {
      @StaticTranslate({ translationKey: 'messages.keywords' })
      role: string;

      @DynamicTranslate()
      title: string;

      constructor(entity: TestEntity) {
        super(entity);
        this.role = entity.role;
        this.title = this.getTranslation(entity, 'title');
      }
    }

    const dto = new TestDto(mockEntity);

    return {
      original: {
        role: 'admin',
        title:
          translations.find((t) => t.languageCode === LanguageCode.en_US)
            ?.title || 'Title',
      },
      translated: dto,
    };
  }
}
