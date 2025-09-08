import { ClassField, StringField, NumberField, BooleanField } from '@/decorators/field.decorator';
import { PageMetaDto } from './page-meta.dto';

export interface IBaseListResponse<TData> {
  data: TData[];
  meta: PageMetaDto;
  message: string;
  statusCode: number;
  success: boolean;
}

export interface IBaseResponse<TData> {
  data: TData;
  message: string;
  statusCode: number;
  success: boolean;
}

type BaseListResponseType<T> = new (
  data: T[],
  meta: PageMetaDto,
  message: string,
  statusCode?: number,
) => IBaseListResponse<T>;

type BaseResponseType<T> = new (data: T, message: string, statusCode?: number) => IBaseResponse<T>;

export function BaseResponseMixin<
  T,
  TArray extends boolean = false,
  TResult = TArray extends true ? BaseListResponseType<T> : BaseResponseType<T>,
>(DtoClass: new (...args: any[]) => T, options?: { array?: TArray }): TResult {
  class BaseResponse implements IBaseResponse<T> {
    @ClassField(() => DtoClass, {
      description: 'The response data',
    })
    data: T;

    @StringField({ description: 'Response message', minLength: 1 })
    message: string;

    @NumberField({
      description: 'HTTP status code',
      int: true,
      isPositive: true,
    })
    statusCode: number;

    @BooleanField({ description: 'Indicates if the request was successful' })
    success: boolean;

    constructor(data: T, message: string, statusCode: number) {
      this.data = data;
      this.message = message;
      this.statusCode = statusCode;
      this.success = true;
    }
  }

  if (options?.array) {
    class BaseListResponse implements IBaseListResponse<T> {
      @ClassField(() => DtoClass, {
        description: 'The response data',
        isArray: true,
      })
      public data: T[];

      @ClassField(() => PageMetaDto)
      public meta: PageMetaDto;

      @StringField({ description: 'Response message', minLength: 1 })
      public message: string;

      @NumberField({
        description: 'HTTP status code',
        int: true,
        isPositive: true,
      })
      public statusCode: number;

      @BooleanField({ description: 'Indicates if the request was successful' })
      public success: boolean;

      constructor(data: T[], meta: PageMetaDto, message: string, statusCode: number) {
        this.data = data;
        this.meta = meta;
        this.message = message;
        this.statusCode = statusCode;
        this.success = true;
      }
    }

    return BaseListResponse as TResult;
  }

  return BaseResponse as TResult;
}
