const ErrorMessage = {
  USER: {
    NOT_FOUND: 'User not found!',
    FIND_ALL_FAILED: 'falied to fetch users!',
    FIND_ONE_FAILED: 'User found failed!',
    CREATION_FAILED: 'Failed to create user!',
    ALREADY_EXISTS: 'User already exists',
    UPDATION_FAILED: 'Failed to update user',
    DELETION_FAILED: 'Failed to delete user',
  },
  ROLE: {
    NOT_FOUND: 'Role not found!',
    GET_BY_ID_FAILED: 'Failed to get role by id',
    ALREADY_EXISTS: 'Role with this name already exists',
    CREATION_FAILED: 'Failed to create role',
    LIST_FAILED: 'failed to fetch roles',
    FIND_ONE_FAILED: 'Role found failed!',
    DELETION_FAILED: 'Failed to delete role',
    UPDATION_FAILED: 'Faileed to update role',
  },
  COMPANY: {
    NOT_FOUND: 'Company not found!',
    GET_BY_ID_FAILED: 'Failed to get company by id',
    CREATION_FAILED: 'Failed to create company',
    LIST_FAILED: 'Failed to fetch companies',
    FIND_ONE_FAILED: 'Company found failed!',
    DELETION_FAILED: 'Failed to delete company',
    UPDATION_FAILED: 'Faileed to update company',
    ALREADY_EXISTS: 'Company with this name already exists',
  },
  TOKEN: {
    INVALID_TYPE: 'Invalid token type',
    CREATION_FAILED: 'failed to create token',
    NOT_FOUND: 'Token not found!',
    GET_TOKEN_FAILED: 'Failed to get token',
    EXPIRED: 'Token has been expired',
    REFRESH_NOT_FOUND: 'Refresh token not found!',
    REVOKE_FAILED: 'Token revokation failed',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    INVALID_ROLE: 'Invalid role',
    EMAIL_NOT_VERIFIED: 'Email not verified',
    EMAIL_ALREADY_VERIFIED: 'Email already verified',
    LOGOUT_FAILED: 'Failed to logout',
    CANNOT_LOGIN_WITH_EMAIL: 'Cannot login with email',
    GOOGLE_ACCOUNT_MISMATCH: 'Google account mismatch',
  },
  PROFILE_SETTING: {
    NOT_FOUND: 'User profile setting not found!',
  },
  SESSION: {
    NOT_FOUND: 'Session not found!',
    UPDATE_FAILED: 'Session update failed',
    ALREAD_LOGOUT: 'Session already logout',
  },
  AUTH_AUDIT_LOG: {
    CREATION_FAILED: 'failed to create auth audit log',
  },
};

export default Object.freeze(ErrorMessage);
