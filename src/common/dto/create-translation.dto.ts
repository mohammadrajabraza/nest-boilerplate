import { LanguageCode } from '@/constants/language-code';
import { EnumField, StringField } from '@/decorators/field.decorator';

export class CreateTranslationDto {
  @EnumField(() => LanguageCode)
  languageCode!: LanguageCode;

  @StringField()
  text!: string;
}
