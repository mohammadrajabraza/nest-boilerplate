import { RoleType } from '@/constants/role-type';
import successMessage from '@/constants/success-message';
import { EmailSignupResponseDto } from '@/modules/auth/dtos/response/email-signup.dto';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { HttpStatus } from '@nestjs/common';

export class SignupMapper {
  static toDomain(user: UserEntity, role: RoleType) {
    const userData = user.toDto({ role });

    return new EmailSignupResponseDto(
      userData,
      successMessage.AUTH.SIGNUP,
      HttpStatus.CREATED,
    );
  }

  static toPersistence() {}
}
