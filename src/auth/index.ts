/**
 * Auth Utilities
 * Password hashing and verification functions
 */

export const hashPassword = async (password: string) => {
  // Bun's built-in bcrypt—cost 10 buat security bagus
  return await Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
};

export const verifyPassword = async (password: string, hash: string) => {
  // Verify langsung, handle $2a/$2b otomatis
  return await Bun.password.verify(password, hash);
};