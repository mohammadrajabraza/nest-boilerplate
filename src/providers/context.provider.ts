import { ClsServiceManager } from 'nestjs-cls';
import { I18nContext } from 'nestjs-i18n';
import { LanguageCode } from '@/constants/language-code';
import type { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';

export class ContextProvider {
  private static readonly nameSpace = 'request';
  private static readonly authUserKey = 'user_key';
  private static readonly languageKey = 'language_key';

  private static get<T>(key: string) {
    const store = ClsServiceManager.getClsService();
    return store.get<T>(ContextProvider.getKeyWithNamespace(key));
  }

  private static set(key: string, value: any): void {
    const store = ClsServiceManager.getClsService();
    store.set(ContextProvider.getKeyWithNamespace(key), value);
  }

  private static getKeyWithNamespace(key: string): string {
    return `${ContextProvider.nameSpace}.${key}`;
  }

  static setAuthUser(user: UserEntity): void {
    ContextProvider.set(ContextProvider.authUserKey, user);
  }

  static setLanguage(language: string): void {
    ContextProvider.set(ContextProvider.languageKey, language);
  }

  static getLanguage(): LanguageCode {
    const lang = ContextProvider.get<LanguageCode>(ContextProvider.languageKey);
    return lang || I18nContext.current()?.lang || LanguageCode.en_US;
  }

  static getAuthUser(): UserEntity | undefined {
    return ContextProvider.get<UserEntity>(ContextProvider.authUserKey);
  }
}
