# Elysia.js Backend Template

![Elysia.js Logo](.github/images/elysia.png)

Template backend lengkap dengan Elysia.js, Drizzle ORM, dan autentikasi JWT untuk pengembangan aplikasi web modern.

## ✨ Fitur

- 🚀 **Elysia.js** - Framework web TypeScript yang cepat dengan Bun runtime
- 🔐 **JWT Authentication** - Sistem login/register dengan token JWT
- 📚 **Swagger Documentation** - Dokumentasi API otomatis
- 🗄️ **Drizzle ORM** - ORM modern untuk PostgreSQL
- 🔒 **Password Hashing** - Hashing password dengan bcrypt (built-in Bun)
- 📝 **TypeScript** - Type safety penuh
- 🎯 **Type Validation** - Validasi request/response dengan TypeBox
- 🛡️ **Rate Limiting** - Proteksi API dari abuse dengan rate limiting
- 🧪 **Testing Suite** - Unit testing dengan Vitest, E2E testing siap pakai

## 🚀 Quick Start

### 1. Clone dan Install Dependencies

```bash
git clone <repository-url>
cd elysia-template
bun install
```

### 2. Setup Database

Pastikan PostgreSQL sudah berjalan, lalu buat database baru:

```sql
CREATE DATABASE myapp;
```

### 3. Konfigurasi Environment

Copy `.env.template` ke `.env` dan isi dengan konfigurasi database Anda:

```bash
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="your_password"
DB_NAME="myapp"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
```

### 4. Setup Database Schema

Jalankan migrasi database:

```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

### 5. Jalankan Development Server

```bash
bun run dev
```

Server akan berjalan di `http://localhost:3000`

## 📖 API Documentation

Setelah server berjalan, akses dokumentasi Swagger di:

- **Swagger UI**: <http://localhost:3000/swagger>
- **API Base URL**: <http://localhost:3000/api>

## 🔧 Available Scripts

### Development

- `bun run dev` - Jalankan development server dengan hot reload

### Build & Production

- `bun run build` - Build aplikasi untuk production
- `bun run start` - Jalankan aplikasi production

### Database

- `bun run migrate:generate` - Generate migrasi database
- `bun run migrate:push` - Push schema ke database
- `bun run db:studio` - Buka Drizzle Studio untuk melihat database

### Testing

- `bun run test` - Jalankan unit tests
- `bun run test:ui` - Jalankan tests dengan UI Vitest
- `bun run test:e2e` - Jalankan end-to-end tests

## 📁 Struktur Proyek

```text
src/
├── auth/          # Fungsi autentikasi (hash, verify, dll)
├── db/           # Konfigurasi database dan schema
│   ├── index.ts  # Koneksi database
│   └── schema.ts # Definisi tabel database
└── index.ts      # Main server dan route definitions
```

## 🔐 API Endpoints

### Authentication

- `POST /api/register` - Registrasi user baru
- `POST /api/login` - Login dan dapatkan JWT token
- `GET /api/profile` - Get user profile (protected)
- `GET /api/users` - Get all users (protected)

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Elysia.js](https://elysiajs.com/)
- **Database**: [PostgreSQL](https://postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [@elysiajs/jwt](https://github.com/elysiajs/eden)
- **Docs**: [@elysiajs/swagger](https://github.com/elysiajs/swagger)
- **Rate Limiting**: [elysia-rate-limit](https://github.com/bogeychan/elysia-rate-limit)
- **Validation**: [TypeBox](https://github.com/sinclairzx81/typebox)
- **Testing**: [Vitest](https://vitest.dev/) + [Supertest](https://github.com/ladjs/supertest)

## 📝 Development Notes

- Password di-hash menggunakan Bun's built-in bcrypt dengan cost 10
- JWT token valid selama 7 hari
- Database menggunakan PostgreSQL dengan Drizzle ORM
- Swagger documentation auto-generate dari route definitions
- Type safety penuh dengan TypeScript dan TypeBox
- Rate limiting aktif untuk mencegah API abuse
- Testing suite lengkap dengan Vitest untuk unit dan E2E testing

## 🚀 Production Deployment

1. Setup environment variables untuk production
2. Pastikan database PostgreSQL tersedia
3. Jalankan migrasi: `drizzle-kit migrate`
4. Build dan deploy aplikasi

---

## Happy coding! 🎉
