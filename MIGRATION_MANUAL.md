# Manual Migration ke Supabase

Karena ada masalah DNS dengan hostname, migrasi bisa dilakukan secara manual melalui Supabase Dashboard.

## Cara 1: Via Supabase Dashboard (Recommended)

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project: `uydzmbzivxdcfefqdimx`
3. Buka **SQL Editor** di sidebar kiri
4. Copy paste SQL berikut:

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

5. Klik **Run** untuk execute SQL
6. Verifikasi table sudah dibuat di **Table Editor**

## Cara 2: Via psql (Jika koneksi berhasil)

```bash
psql "postgresql://postgres:lumi123@db.uydzmbzivxdcfefqdimx.supabase.co:5432/postgres?sslmode=require" -f drizzle/0000_initial_users_table.sql
```

## Troubleshooting

### Error: DNS tidak bisa resolve
- Pastikan koneksi internet aktif
- Verifikasi hostname Supabase di dashboard
- Coba gunakan connection string dari Supabase Dashboard → Settings → Database

### Error: Table already exists
- Table sudah ada, skip migration
- Atau drop table dulu jika ingin reset: `DROP TABLE IF EXISTS users;`

### Verifikasi Connection String
1. Buka Supabase Dashboard
2. Settings → Database
3. Copy **Connection string** (URI format)
4. Update di `.env` file

## File Migration

File migration ada di: `drizzle/0000_initial_users_table.sql`
