/**
 * Users DAO (Data Access Object)
 * Semua operasi database untuk users table
 */

import { db } from '../db';
import { users } from '../db/schema';
import { eq, or } from 'drizzle-orm';

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string) => 
  await db.select().from(users).where(eq(users.email, email)).limit(1);

/**
 * Find user by username
 */
export const findUserByUsername = async (username: string) => 
  await db.select().from(users).where(eq(users.username, username)).limit(1);

/**
 * Find user by email or username
 */
export const findUserByEmailOrUsername = async (identifier: string) => 
  await db.select().from(users).where(
    or(eq(users.email, identifier), eq(users.username, identifier))
  ).limit(1);

/**
 * Create new user
 */
export const createUser = async (data: {
  username: string;
  email: string;
  password: string;
  fullname: string;
  tenant_id?: number;
}) => {
  const now = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '').slice(0, 14); // Format YYYYMMDDHHMMSS (14 chars)
  
  return await db.insert(users).values({
    tenant_id: data.tenant_id || 1,
    username: data.username,
    email: data.email,
    password: data.password, // Should be hashed before calling this
    fullname: data.fullname,
    phone: '',
    private_key: '',
    active: 'Y',
    active_datetime: now,
    non_active_datetime: '',
    create_user_id: -1,
    update_user_id: -1,
    create_datetime: now,
    update_datetime: '',
    version: 0
  }).returning();
};

/**
 * Get all active users
 */
export const getAllActiveUsers = async () => 
  await db.select().from(users).where(eq(users.active, 'Y'));

/**
 * Find user by ID
 */
export const findUserById = async (userId: number) => 
  await db.select().from(users).where(eq(users.user_id, userId)).limit(1);

