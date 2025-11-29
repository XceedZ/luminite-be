# Migration Guide - Add Username Field

## Migration File

File migration: `drizzle/0001_add_username_to_users.sql`

## Cara Menjalankan Migration

### Option 1: Menggunakan Drizzle Kit (Recommended)

```bash
cd /Users/xceedz/Documents/Projects/elysia-template
bun run migrate:push
```

### Option 2: Manual SQL

Jalankan SQL langsung ke database:

```sql
-- Add username column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" text NOT NULL DEFAULT '';

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" ("username");

-- Update existing users with default username
UPDATE "users" 
SET "username" = LOWER(SPLIT_PART("email", '@', 1)) || '_' || "user_id"
WHERE "username" = '' OR "username" IS NULL;

-- Make username NOT NULL
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
```

## Perubahan Schema

### Sebelum:
```typescript
{
  user_id: number
  tenant_id: number
  email: string (unique)
  password: string
  fullname: string
  // ... other fields
}
```

### Sesudah:
```typescript
{
  user_id: number
  tenant_id: number
  username: string (unique) // NEW
  email: string (unique)
  password: string
  fullname: string
  // ... other fields
}
```

## API Changes

### Register Endpoint

**Before:**
```json
POST /api/register
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**After:**
```json
POST /api/register
{
  "username": "johndoe",
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login Endpoint

**Before:**
```json
POST /api/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**After:**
```json
POST /api/login
{
  "emailOrUsername": "john@example.com", // or "johndoe"
  "password": "password123"
}
```

## Validation Rules

- **Username:**
  - Min length: 3 characters
  - Max length: 30 characters
  - Must be unique
  - Alphanumeric + underscore/hyphen recommended

- **Email:**
  - Must be valid email format
  - Must be unique

## Testing

Setelah migration, test dengan:

1. **Register dengan username:**
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "fullname": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

2. **Login dengan email:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "password123"
  }'
```

3. **Login dengan username:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "testuser",
    "password": "password123"
  }'
```

