import { PasswordField, BooleanFieldOptional } from '@/decorators/field.decorator';

export class ChangePasswordBodyDto {
  @PasswordField({
    swagger: true,
    description: 'New password (minimum 6 characters)',
    example: 'newSecurePassword123',
    minLength: 6,
  })
  password: string;

  @PasswordField({
    swagger: true,
    match: 'password',
    description: 'Confirm new password (must match password field)',
    example: 'newSecurePassword123',
    minLength: 6,
  })
  confirmPassword: string;

  @BooleanFieldOptional({
    swagger: true,
    description: 'If true, all active sessions will be terminated and user will need to login everywhere again',
    example: false,
  })
  shouldLogoutAllSessions?: boolean;
}
