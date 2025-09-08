import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable, UseInterceptors } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AbstractDto } from '@/common/dto/abstract.dto';
import { TranslationService } from '@/shared/services/translation.service';

@Injectable()
export class TranslationInterceptor implements NestInterceptor {
  constructor(private readonly translationService: TranslationService) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      mergeMap(async (data) => {
        if (data instanceof AbstractDto) {
          return this.translationService.translateNecessaryKeys(data);
        }
        if (Array.isArray(data) && data.every((item) => item instanceof AbstractDto)) {
          return Promise.all(data.map((item) => this.translationService.translateNecessaryKeys(item)));
        }

        if (typeof data === 'object') {
          const result = {};
          for (const key in data) {
            if (data[key] instanceof AbstractDto) {
              result[key] = await this.translationService.translateNecessaryKeys(data[key]);
            } else {
              result[key] = data[key];
            }
          }

          return result;
        }
        return data;
      }),
    );
  }
}

export function UseTranslationInterceptor() {
  return UseInterceptors(TranslationInterceptor);
}
