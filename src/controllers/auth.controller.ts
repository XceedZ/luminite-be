/**
 * Auth Controller
 * Handle authentication logic (register, login)
 */

import { hashPassword, verifyPassword } from '../auth';
import { 
  findUserByEmail, 
  findUserByEmailOrUsername, 
  createUser 
} from '../dao/users';
import { STATUS, MESSAGES, ERROR_MESSAGES, getMessage } from '../constants';

/**
 * Register new user
 */
export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
  fullname: string;
  tenant_id?: number;
}) => {
  console.log('🔵 [AUTH CONTROLLER] Register user called with:', {
    username: data.username,
    email: data.email,
    fullname: data.fullname,
    hasPassword: !!data.password,
    tenant_id: data.tenant_id
  });

  // Check if username already exists
  console.log('🔵 [AUTH CONTROLLER] Checking if username exists:', data.username);
  const [existingUsername] = await findUserByEmailOrUsername(data.username);
  if (existingUsername) {
    console.log('❌ [AUTH CONTROLLER] Username already exists:', data.username);
    return {
      status: STATUS.BAD_REQUEST,
      message: getMessage(STATUS.BAD_REQUEST, ERROR_MESSAGES.USERNAME_EXISTS),
      error: true
    };
  }
  console.log('✅ [AUTH CONTROLLER] Username is available');

  // Check if email already exists
  console.log('🔵 [AUTH CONTROLLER] Checking if email exists:', data.email);
  const [existingEmail] = await findUserByEmail(data.email);
  if (existingEmail) {
    console.log('❌ [AUTH CONTROLLER] Email already exists:', data.email);
    return {
      status: STATUS.BAD_REQUEST,
      message: getMessage(STATUS.BAD_REQUEST, ERROR_MESSAGES.EMAIL_EXISTS),
      error: true
    };
  }
  console.log('✅ [AUTH CONTROLLER] Email is available');

  // Hash password
  console.log('🔵 [AUTH CONTROLLER] Hashing password...');
  const hashedPassword = await hashPassword(data.password);
  console.log('✅ [AUTH CONTROLLER] Password hashed');

  // Create user
  console.log('🔵 [AUTH CONTROLLER] Creating user in database...');
  const [newUser] = await createUser({
    username: data.username,
    email: data.email,
    password: hashedPassword,
    fullname: data.fullname,
    tenant_id: data.tenant_id
  });
  console.log('✅ [AUTH CONTROLLER] User created successfully:', {
    user_id: newUser.user_id,
    username: newUser.username,
    email: newUser.email
  });

  // Return user data with username, email, and fullname
  return {
    status: STATUS.OK,
    message: getMessage(STATUS.OK, MESSAGES.USER_CREATED),
    data: {
      user: {
        user_id: newUser.user_id,
        username: newUser.username || '',
        fullname: newUser.fullname || '',
        email: newUser.email || ''
      }
    },
    error: false
  };
};

/**
 * Login user
 */
export const loginUser = async (data: {
  emailOrUsername: string;
  password: string;
}) => {
  console.log('🔵 [AUTH CONTROLLER] Login user called with:', {
    emailOrUsername: data.emailOrUsername,
    hasPassword: !!data.password
  });

  // Find user by email or username
  console.log('🔵 [AUTH CONTROLLER] Finding user by email/username...');
  const [user] = await findUserByEmailOrUsername(data.emailOrUsername);
  
  if (!user) {
    console.log('❌ [AUTH CONTROLLER] User not found:', data.emailOrUsername);
    return {
      status: STATUS.UNAUTHORIZED,
      message: getMessage(STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS),
      error: true
    };
  }
  console.log('✅ [AUTH CONTROLLER] User found:', user.user_id);

  // Verify password
  console.log('🔵 [AUTH CONTROLLER] Verifying password...');
  const isValidPassword = await verifyPassword(data.password, user.password);
  if (!isValidPassword) {
    console.log('❌ [AUTH CONTROLLER] Invalid password');
    return {
      status: STATUS.UNAUTHORIZED,
      message: getMessage(STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS),
      error: true
    };
  }
  console.log('✅ [AUTH CONTROLLER] Password verified, login successful');

  // Return user data with username, email, and fullname
  return {
    status: STATUS.OK,
    message: getMessage(STATUS.OK, MESSAGES.LOGIN_SUCCESS),
    data: {
      user: {
        user_id: user.user_id,
        username: user.username || '',
        fullname: user.fullname || '',
        email: user.email || ''
      }
    },
    error: false
  };
};

