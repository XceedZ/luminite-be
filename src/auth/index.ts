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

export const createUser = async (email: string, password: string, name: string) => {
  const hashed = await hashPassword(password);
  return await db.insert(users).values({ email, password: hashed, name }).returning();
};

export const findUserByEmail = async (email: string) => 
  await db.select().from(users).where(eq(users.email, email)).limit(1);