import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const hashPassword = async (password: string) => {
  // Bun's built-in bcrypt—cost 10 buat security bagus
  return await Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
};

export const verifyPassword = async (password: string, hash: string) => {
  // Verify langsung, handle $2a/$2b otomatis
  return await Bun.password.verify(password, hash);
};

export const createUser = async (email: string, password: string, fullname: string, tenant_id: number = 1) => {
  const hashed = await hashPassword(password);
  const now = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '').slice(0, 14); // Format YYYYMMDDHHMMSS (14 chars)
  return await db.insert(users).values({
    tenant_id,
    email,
    password: hashed,
    fullname,
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

export const findUserByEmail = async (email: string) => 
  await db.select().from(users).where(eq(users.email, email)).limit(1);