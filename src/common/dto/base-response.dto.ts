import {
  ClassField,
  StringField,
  NumberField,
  BooleanField,
} from '@/decorators/field.decorator';

export function BaseResponseMixin<T, TArray extends boolean>(
  DtoClass: new (...args: any[]) => T,
  options?: { array?: TArray },
) {
  class BaseResponse {
    // Conditionally set data as T or T[] based on options.array
    @ClassField(() => DtoClass, {
      description: 'The response data',
      ...(options?.array ? { isArray: true } : {}), // Set isArray if array: true
    })
    data: TArray extends true ? T[] : T;

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

    constructor(
      data: TArray extends true ? T[] : T,
      message: string,
      statusCode: number,
    ) {
      this.data = data;
      this.message = message;
      this.statusCode = statusCode;
      this.success = true;
    }
  }

  return BaseResponse;
}
