import { UUIDField } from '@/decorators/field.decorator';

export class TerminateUserSessionsBodyDto {
  @UUIDField({
    swagger: true,
    description: 'User ID whose sessions should be terminated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;
}
