# Supabase Database Setup

## Connection Details

Database sudah dikonfigurasi untuk menggunakan Supabase PostgreSQL.

### Connection String
```
postgresql://postgres:lumi123@db.uydzmbzivxdcfefqdimx.supabase.co:5432/postgres
```

### Environment Variables

File `.env` sudah dikonfigurasi dengan:
- `DATABASE_URL`: Connection string lengkap
- `DB_HOST`: db.uydzmbzivxdcfefqdimx.supabase.co
- `DB_PORT`: 5432
- `DB_USER`: postgres
- `DB_PASSWORD`: lumi123
- `DB_NAME`: postgres
- `DB_SSL`: true (required for Supabase)

## Running Migrations

### Generate Migration
```bash
bun run migrate:generate
```

### Push Migration to Supabase
```bash
bun run migrate:push
```

### Open Drizzle Studio
```bash
bun run db:studio
```

## Important Notes

1. **SSL Required**: Supabase memerlukan SSL connection, sudah di-set otomatis
2. **Connection Pooling**: Max 10 connections (bisa disesuaikan)
3. **Security**: Jangan commit file `.env` ke repository

## Testing Connection

Test koneksi database akan otomatis dilakukan saat server start:
```
✅ Database connection successful
```

Jika ada error, pastikan:
- Password benar: `lumi123`
- Network access ke Supabase sudah diizinkan
- SSL connection enabled

## Frontend Integration

Untuk frontend (Next.js), gunakan:
- `NEXT_PUBLIC_SUPABASE_URL`: https://uydzmbzivxdcfefqdimx.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (lihat di .env)
