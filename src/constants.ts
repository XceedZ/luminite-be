// API Status Codes
export const STATUS = {
  OK: 'OK',
  ERROR: 'ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

// API Messages (Success & Info)
export const MESSAGES = {
  // Auth messages
  USER_CREATED: 'user.created',
  LOGIN_SUCCESS: 'login.success',
  LOGOUT_SUCCESS: 'logout.success',

  // Generic messages
  WELCOME: 'welcome',
  OPERATION_SUCCESS: 'operation.success',
  DATA_RETRIEVED: 'data.retrieved'
} as const;

// API Error Messages (without prefix - will be added automatically)
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  USER_NOT_FOUND: 'user_not_found',
  EMAIL_EXISTS: 'email_already_exists',
  USERNAME_EXISTS: 'username_already_exists',
  UNAUTHORIZED: 'unauthorized',
  TOKEN_EXPIRED: 'token_expired',
  TOKEN_INVALID: 'token_invalid',
  BAD_REQUEST: 'bad_request',
  INTERNAL_ERROR: 'internal_error'
} as const;

// Helper function to get message with automatic prefix based on status
export function getMessage(status: keyof typeof STATUS, messageKey: string): string {
  if (status === 'ERROR' || status === 'UNAUTHORIZED' || status === 'NOT_FOUND' || status === 'BAD_REQUEST' || status === 'CONFLICT' || status === 'INTERNAL_ERROR') {
    return `error.${messageKey}`;
  }
  return messageKey;
}
