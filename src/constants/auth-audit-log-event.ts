export enum AuthAuditLogEvent {
  PASSWORD_CHANGE = 'password_change',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  SIGNUP_SUCCESS = 'signup_success',
  SIGNUP_FAILURE = 'signup_failure',
  FORGOT_PASSWORD_SUCCESS = 'forgot_password_success',
  FORGOT_PASSWORD_FAILURE = 'forgot_password_failure',
  RESET_PASSWORD_SUCCESS = 'reset_password_success',
  RESET_PASSWORD_FAILURE = 'reset_password_failure',
  ME_SUCCESS = 'me_success',
  ME_FAILURE = 'me_failure',
  REFRESH_SUCCESS = 'refresh_success',
  REFRESH_FAILURE = 'refresh_failure',
  LOGOUT_SUCCESS = 'logout_success',
  LOGOUT_FAILURE = 'logout_failure',
  EMAIL_VERIFIED_SUCCESS = 'email_verified_success',
  EMAIL_VERIFIED_ERROR = 'email_verified_error',
  EMAIL_RESEND_SUCCESS = 'email_resend_success',
  EMAIL_RESEND_ERROR = 'email_resend_error',
}
