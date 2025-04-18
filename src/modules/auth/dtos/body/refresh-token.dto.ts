import { StringFieldOptional } from '@/decorators/field.decorator';

export class RefreshTokenBody {
  @StringFieldOptional({ swagger: true })
  deviceToken: string | null;

  @StringFieldOptional({ swagger: true })
  timeZone: string | null;
}
