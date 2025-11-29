-- Migration: Add username column to users table
-- Generated manually for adding username field

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" text NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" ("username");

-- Update existing users with a default username based on email if username is empty
UPDATE "users" 
SET "username" = LOWER(SPLIT_PART("email", '@', 1)) || '_' || "user_id"
WHERE "username" = '' OR "username" IS NULL;

-- Make username NOT NULL after setting defaults
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
