# Vercel Deployment Troubleshooting

## Masalah: Serverless Function Crashed

Jika build berhasil tapi serverless function crash, ini adalah masalah umum dengan beberapa kemungkinan penyebab. Berikut langkah-langkah troubleshooting berdasarkan referensi dan best practices:

### ⚠️ **PENTING: Cek Function Logs Terlebih Dahulu**

**Langkah paling penting:** Cek Function Logs di Vercel Dashboard untuk melihat error spesifik:
1. Buka Vercel Dashboard → Project Anda
2. Klik tab **"Functions"**
3. Klik function yang error
4. Lihat tab **"Logs"** untuk detail error

Error message spesifik akan membantu debugging lebih lanjut.

### 1. **Database Connection Issues (Paling Umum)**

Masalah database connection adalah penyebab paling umum untuk serverless function crash:

**Gejala:**
- Function crash saat pertama kali diakses (cold start)
- Error terkait database connection timeout
- Function berhasil build tapi crash saat runtime

**Solusi:**
- ✅ Pastikan `DATABASE_URL` atau database credentials sudah benar
- ✅ Pastikan database accessible dari internet (tidak di-block firewall)
- ✅ Untuk Supabase/cloud databases: pastikan IP Vercel di-whitelist
- ✅ Check SSL settings jika menggunakan cloud database
- ✅ Pastikan connection pooling sudah dikonfigurasi (sudah ada di `src/db/index.ts`)

**Test Connection:**
```bash
# Test dengan psql
psql "postgresql://user:password@host:port/database"

# Atau test dengan Node.js
node -e "require('postgres')('postgresql://...').then(() => console.log('OK')).catch(console.error)"
```

### 2. **Environment Variables**

Pastikan semua environment variables sudah di-set di Vercel Dashboard:
- Settings → Environment Variables

**Required Variables:**
```bash
DATABASE_URL=postgresql://user:password@host:port/database
# ATAU
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

### 3. **Function Logs (PENTING!)**

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Klik "Functions" tab
4. Klik function yang error
5. Lihat "Logs" untuk detail error

### 4. **Cold Start Issues**

Pastikan database accessible dari internet (untuk cloud deployment):
- Check firewall settings
- Verify connection string
- Test connection dengan tool seperti `psql` atau database client

### 4. **Cek Cold Start Issues**

Database connection mungkin gagal saat cold start. Pastikan:
- Connection pooling sudah dikonfigurasi dengan benar
- Database tidak timeout saat idle

### 5. **Alternative: Use Railway/Fly.io/Render**

Jika masalah masih berlanjut, pertimbangkan menggunakan platform yang lebih kompatibel dengan Bun:

**Railway (Recommended):**
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

**Fly.io:**
```bash
curl -L https://fly.io/install.sh | sh
fly auth login
fly launch
fly deploy
```

### 6. **Debug Locally**

Test dengan Vercel CLI:
```bash
npm i -g vercel
vercel dev
```

Ini akan menjalankan function secara lokal dengan environment yang sama seperti production.

### 7. **Check Bun Runtime Version**

Cek `vercel.json`:
```json
{
  "functions": {
    "api/index.ts": {
      "runtime": "bun@1.x"
    }
  }
}
```

Pastikan format ini benar.

### 8. **Common Issues**

#### Issue: Database Connection Failed
**Solution:** 
- Pastikan `DATABASE_URL` atau database credentials sudah benar
- Pastikan database accessible dari internet
- Check SSL settings jika menggunakan cloud database

#### Issue: JWT_SECRET not defined
**Solution:**
- Pastikan `JWT_SECRET` sudah di-set di Vercel Dashboard
- Minimal 32 karakter untuk keamanan

#### Issue: Module not found
**Solution:**
- Pastikan semua dependencies sudah di-install
- Check `package.json` untuk dependencies yang benar

#### Issue: Timeout
**Solution:**
- Optimize database queries
- Add connection pooling
- Reduce cold start time

### 9. **Check Function Logs Format**

Error biasanya muncul dalam format:
```
Error: [error message]
at [file]:[line]
```

Cari error message spesifik untuk debugging lebih lanjut.

### 10. **Contact Support**

Jika semua langkah di atas sudah dicoba tapi masih error:
- Check Vercel Status: https://www.vercel-status.com/
- Vercel Community: https://github.com/vercel/vercel/discussions
- Vercel Support: support@vercel.com

