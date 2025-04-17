import {
  ClassField,
  StringField,
  NumberField,
  BooleanField,
} from '@/decorators/field.decorator';

export function BaseResponseMixin<T>(DtoClass: new (...args: any[]) => T) {
  class BaseResponse {
    @ClassField(() => DtoClass, { description: 'The response data' })
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

  return BaseResponse;
}
