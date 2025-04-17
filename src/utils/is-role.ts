import { RoleType } from '@/constants/role-type';

export const isRole = (role: string | null) => {
  const value = [RoleType.ADMIN, RoleType.USER].find((r) => role && r === role);
  if (!value) throw new Error('Invalid role');

  return value;
};
