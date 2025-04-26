const SuccessMessage = {
  AUTH: {
    LOGIN: 'Login successful',
    REFRESH_TOKEN: 'Tokens refreshed successfully',
    SIGNUP: 'Signup successful, Please verify your email',
    RESEND: 'Verification email has been send again',
    FORGOT_PASSWORD: 'Reset password email has been sent',
    RESET_PASSWORD: 'Password has been successfully reset!',
    CHANGE_PASSWORD: 'Password has been successfully changed!',
    GET_ME: 'Get user info',
    LOGOUT: 'logout successful',
  },
  USER: {
    CREATE: 'User created successfully',
    LIST: 'User listed successfully',
    UPDATE: 'User updated sccessfully',
    DELETE: 'User deleted succesfully',
    GET: 'User get successfully',
  },
  ROLE: {
    CREATE: 'Role created successfully',
    LIST: 'Role listed successfully',
    UPDATE: 'Role updated sccessfully',
    DELETE: 'Role deleted succesfully',
    GET: 'Role get successfully',
  },
  COMPANY: {
    CREATE: 'Company created successfully',
    LIST: 'Company listed successfully',
    UPDATE: 'Company updated sccessfully',
    DELETE: 'Company deleted succesfully',
    GET: 'Company get successfully',
  },
};

export default Object.freeze(SuccessMessage);
