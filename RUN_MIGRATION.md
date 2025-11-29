# Cara Menjalankan Migration ke Supabase

## Option 1: Menggunakan Script Migration (Recommended)

```bash
cd /Users/xceedz/Documents/Projects/elysia-template
bun run migrate:supabase
```

Script akan:
1. Connect ke Supabase menggunakan connection string dari `.env`
2. Execute SQL migration file
3. Create table `users` dengan field `username`

## Option 2: Menggunakan Drizzle Kit Push

```bash
cd /Users/xceedz/Documents/Projects/elysia-template
bun run migrate:push
```

## Option 3: Manual SQL (via Supabase Dashboard)

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project: `uydzmbzivxdcfefqdimx`
3. Buka SQL Editor
4. Copy paste isi file `drizzle/0000_initial_users_table.sql`
5. Run query

## Migration File

File: `drizzle/0000_initial_users_table.sql`

```sql
-- Initial migration: Create users table with username
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer DEFAULT 1 NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text DEFAULT '' NOT NULL,
	"fullname" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '',
	"private_key" text DEFAULT '',
	"active" text DEFAULT 'Y' NOT NULL,
	"active_datetime" text DEFAULT '',
	"non_active_datetime" text DEFAULT '',
	"create_user_id" integer DEFAULT -1 NOT NULL,
	"update_user_id" integer DEFAULT -1,
	"create_datetime" text DEFAULT '',
	"update_datetime" text DEFAULT '',
	"version" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
```

## Verifikasi

Setelah migration, test dengan:

```bash
# Test connection
bun run dev

# Harus muncul:
# ✅ Database connection successful
```

## Troubleshooting

Jika error "table already exists":
- Table sudah ada, skip migration
- Atau drop table dulu jika ingin reset

Jika error connection:
- Pastikan password benar: `lumi123`
- Pastikan network access ke Supabase sudah diizinkan
- Check `.env` file sudah benar
