import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable, UseInterceptors } from '@nestjs/common';
import type { Request } from 'express';
import { LanguageCode } from '@/constants/language-code';
import { ContextProvider } from '@/providers/context.provider';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    const language: string = request.headers['x-locale'] as string;

    if (Object.values(LanguageCode).includes(language as LanguageCode)) {
      ContextProvider.setLanguage(language);
    } else {
      ContextProvider.setLanguage(LanguageCode.en_US);
    }

    return next.handle();
  }
}

export function UseLanguageInterceptor() {
  return UseInterceptors(LanguageInterceptor);
}
