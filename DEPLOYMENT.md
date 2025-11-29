# Deployment Guide untuk Elysia.js Backend

Elysia.js dirancang untuk **Bun runtime**, yang berarti deployment ke Vercel (yang menggunakan Node.js) bisa mengalami masalah kompatibilitas.

## 🚀 Opsi Deployment

### 1. **Railway** (Recommended - Support Bun Native) ⭐

Railway mendukung Bun secara native dan sangat mudah digunakan.

#### Setup:
1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login ke Railway:
   ```bash
   railway login
   ```

3. Deploy:
   ```bash
   railway init
   railway up
   ```

4. Set Environment Variables di Railway Dashboard:
   - `DATABASE_URL` atau `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET`

#### Railway Configuration:
Buat file `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "bun run src/index.ts",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Atau buat `Procfile`:
```
web: bun run src/index.ts
```

### 2. **Fly.io** (Support Bun)

Fly.io juga mendukung Bun runtime.

#### Setup:
1. Install Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Login:
   ```bash
   fly auth login
   ```

3. Initialize:
   ```bash
   fly launch
   ```

4. Set secrets:
   ```bash
   fly secrets set DATABASE_URL="your-db-url"
   fly secrets set JWT_SECRET="your-secret"
   ```

5. Deploy:
   ```bash
   fly deploy
   ```

### 3. **Render** (Support Bun)

Render juga mendukung Bun.

#### Setup:
1. Connect repository ke Render
2. Pilih "Web Service"
3. Build Command: `bun install`
4. Start Command: `bun run src/index.ts`
5. Set Environment Variables di dashboard

### 4. **Vercel** (Tidak Recommended - Node.js Only)

Vercel menggunakan Node.js, bukan Bun. Ini bisa menyebabkan masalah kompatibilitas.

Jika tetap ingin menggunakan Vercel:
- Gunakan `api/index.ts` yang sudah dibuat
- Pastikan semua environment variables sudah di-set
- Check logs di Vercel Dashboard untuk error details

**Catatan**: Elysia mungkin tidak berfungsi dengan baik di Vercel karena perbedaan runtime.

## 📝 Environment Variables

Pastikan semua environment variables berikut sudah di-set:

```bash
# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

Atau jika menggunakan connection string:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

## 🔍 Troubleshooting

### Error: "Cannot find module"
- Pastikan semua dependencies sudah di-install
- Jalankan `bun install` sebelum deploy

### Error: "Database connection failed"
- Pastikan database URL/host sudah benar
- Pastikan database accessible dari internet (untuk cloud deployment)
- Check firewall settings

### Error: "JWT_SECRET is not defined"
- Pastikan environment variable `JWT_SECRET` sudah di-set
- Minimal 32 karakter untuk keamanan

## 🎯 Recommended: Railway

Railway adalah pilihan terbaik karena:
- ✅ Support Bun secara native
- ✅ Auto-deploy dari GitHub
- ✅ Free tier yang generous
- ✅ Easy database setup
- ✅ Built-in PostgreSQL

