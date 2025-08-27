import {
  PasswordField,
  BooleanFieldOptional,
} from '@/decorators/field.decorator';

export class ResetPasswordBodyDto {
  @PasswordField({
    swagger: true,
    description: 'New password (minimum 8 characters)',
    example: 'newSecurePassword123',
    minLength: 8,
  })
  password: string;

  @BooleanFieldOptional({
    swagger: true,
    description:
      'If true, all active sessions will be terminated and user will need to login everywhere again',
    example: false,
  })
  shouldLogoutAllSessions?: boolean;
}
