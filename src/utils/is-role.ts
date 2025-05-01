import { RoleType } from '@/constants/role-type';
import { UnauthorizedException } from '@nestjs/common';

export const isRole = (role: string | null) => {
  const value = [RoleType.ADMIN, RoleType.USER].find((r) => role && r === role);
  if (!value) throw new UnauthorizedException('Invalid role');

  return value;
};
