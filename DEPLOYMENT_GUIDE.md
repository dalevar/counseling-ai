# Panduan Deploy Gratis: Backend dengan Supabase dan Frontend dengan Vercel

Dokumen ini dibuat khusus untuk repository `counseling-ai` agar proses deployment sesuai dengan struktur project yang ada sekarang:

- `backend/` = Express + TypeScript + Prisma + Redis + Socket.IO
- `frontend/` = React + Vite

Dokumen ini fokus ke target yang Anda minta:

1. backend memakai Supabase
2. frontend di-host gratis di Vercel

## Ringkasan Penting

Sebelum deploy, ada satu hal yang harus dijelaskan dengan jujur:

- **Supabase tidak menjalankan server Express Node.js secara langsung**
- Supabase gratis sangat cocok untuk:
  - PostgreSQL database
  - Auth
  - Storage
  - Edge Functions
- Tetapi backend project ini saat ini adalah **server Express penuh**, bukan Supabase Edge Function
- Backend project ini **masih bisa dideploy ke Vercel** sebagai serverless HTTP API, selama Anda menerima keterbatasan berikut:
  - Socket.IO server tidak berjalan seperti server persistent
  - Redis sebaiknya opsional
  - workload panjang tidak cocok di serverless

Jadi untuk codebase yang sekarang, ada 2 jalur:

1. **Jalur paling realistis untuk repo saat ini**
   - Supabase dipakai sebagai database PostgreSQL
   - Backend API HTTP di Vercel
   - Frontend di Vercel

2. **Jalur gratis yang benar-benar Supabase + Vercel**
   - Fitur backend dipindahkan bertahap ke Supabase
   - Frontend memanggil Supabase langsung atau lewat Edge Functions
   - Kode `backend/` lama tidak lagi menjadi server utama

Karena Anda meminta Supabase + backend Vercel + frontend Vercel, panduan ini memakai **jalur pertama sebagai implementasi utama repo saat ini**, lalu saya tambahkan catatan migrasi penuh ke Supabase bila nanti ingin lebih hemat dan sederhana.

---

## 1. Arsitektur yang Direkomendasikan

Untuk hosting gratis, arsitektur yang paling masuk akal adalah:

- `frontend/` di-deploy ke Vercel
- `backend/` di-deploy ke Vercel sebagai HTTP serverless function
- database PostgreSQL memakai Supabase
- file upload idealnya dipindah ke Supabase Storage atau Cloudinary
- autentikasi tetap bisa memakai JWT custom yang sekarang
- Redis dibuat opsional

Skema sederhananya:

```text
User Browser
   |
   v
Vercel Frontend (React + Vite)
   |
   +--> Vercel Backend API (Express serverless)
             |
             +--> Supabase Postgres
             +--> Redis (opsional)
             +--> Cloudinary / Supabase Storage
```

---

## 2. Kondisi Project Saat Ini

Beberapa fakta dari codebase saat ini yang penting untuk deployment:

- frontend memakai base URL dari `VITE_API_URL`
- file [frontend/src/api/client.ts](D:/projects/counseling-ai/frontend/src/api/client.ts:1) punya fallback:

```ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
```

- backend memakai Prisma PostgreSQL dari `DATABASE_URL`
- file [backend/src/config/index.ts](D:/projects/counseling-ai/backend/src/config/index.ts:1) membaca:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
  - `FRONTEND_URL`
  - email config
  - Cloudinary config
  - API key AI

- backend sekarang sudah disiapkan entrypoint Vercel di:
  - [backend/api/index.ts](D:/projects/counseling-ai/backend/api/index.ts:1)
  - [backend/vercel.json](D:/projects/counseling-ai/backend/vercel.json:1)
- frontend sekarang sudah disiapkan rewrite SPA di:
  - [frontend/vercel.json](D:/projects/counseling-ai/frontend/vercel.json:1)
- health check backend sekarang akan menganggap Redis `disabled` jika `REDIS_URL` tidak diisi

Artinya:

- backend HTTP project ini sekarang bisa dideploy ke Vercel
- Supabase akan dipakai sebagai PostgreSQL utama
- Redis bisa dikosongkan bila Anda belum punya layanan Redis
- fitur Socket.IO tidak cocok dijadikan fitur utama di deployment Vercel

---

## 3. Strategi Deploy Gratis yang Paling Aman

### Opsi A. Direkomendasikan untuk repo ini sekarang

- Frontend: Vercel
- Backend API: Vercel
- Database: Supabase PostgreSQL
- Redis: opsional
- Storage: Cloudinary atau Supabase Storage

Ini adalah opsi yang paling dekat dengan codebase saat ini dan paling cepat dipakai.

### Opsi B. Jika ingin full Supabase di masa depan

- Frontend: Vercel
- Database: Supabase PostgreSQL
- Auth: Supabase Auth
- Storage: Supabase Storage
- Logic backend tertentu: Supabase Edge Functions

Ini lebih hemat dan cocok untuk arsitektur serverless murni, tetapi perlu refactor lebih besar.

---

## 4. Prasyarat

Sebelum mulai, siapkan:

- akun GitHub
- akun Supabase
- akun Vercel
- Node.js 20+
- npm

Disarankan juga install:

```bash
npm install -g supabase
```

Kalau belum punya Supabase CLI, Anda tetap bisa mengatur project lewat dashboard web Supabase.

---

## 5. Membuat Project Supabase

### Langkah 1. Buat project baru

1. Buka [Supabase](https://supabase.com/)
2. Klik `New project`
3. Isi:
   - Project name: misalnya `counseling-ai`
   - Database password: buat password kuat
   - Region: pilih yang paling dekat dengan user
4. Tunggu project selesai dibuat

### Langkah 2. Ambil informasi koneksi

Setelah project aktif, buka:

- `Project Settings`
- `Database`

Catat:

- `Host`
- `Port`
- `Database name`
- `User`
- `Password`
- `Connection string`

Untuk Prisma biasanya formatnya seperti ini:

```env
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

Atau direct connection:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Langkah 3. Ambil URL API dan key

Di dashboard Supabase buka:

- `Project Settings`
- `Data API`

Catat:

- `Project URL`
- `anon public key`
- `service_role key`

Gunakan dengan aman:

- `anon key` boleh dipakai di frontend
- `service_role key` **jangan pernah** dipakai di frontend

---

## 6. Menghubungkan Prisma Backend ke Supabase PostgreSQL

Project backend ini memakai Prisma schema di:

- [backend/src/database/prisma/schema.prisma](D:/projects/counseling-ai/backend/src/database/prisma/schema.prisma:1)

### Langkah 1. Buat file env backend

Buat file:

- `backend/.env`

Contoh minimal:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://nama-project-anda.vercel.app

DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

REDIS_URL=redis://localhost:6379

JWT_SECRET=ganti_dengan_secret_panjang
JWT_REFRESH_SECRET=ganti_dengan_refresh_secret_panjang
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=example@example.com
EMAIL_PASS=password_email
EMAIL_FROM=EduCouns AI <no-reply@example.com>

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GEMINI_API_KEY=
OPENAI_API_KEY=
GITHUB_MODELS_TOKEN=
```

### Langkah 2. Generate Prisma client

Masuk ke folder backend:

```bash
cd backend
npm ci
npx prisma generate --schema=src/database/prisma/schema.prisma
```

### Langkah 3. Push schema ke Supabase

Kalau Anda belum punya migration production yang rapi, cara paling cepat untuk awal:

```bash
npx prisma db push --schema=src/database/prisma/schema.prisma
```

Kalau nanti project sudah memakai migration formal:

```bash
npx prisma migrate deploy --schema=src/database/prisma/schema.prisma
```

### Langkah 4. Verifikasi tabel di Supabase

Di dashboard Supabase buka:

- `Table Editor`

Pastikan tabel dari Prisma sudah muncul, misalnya:

- `User`
- `Role`
- `Student`
- `SessionCounseling`
- `AIConversation`
- `MentalHealthAssessment`

---

## 7. Deploy Backend API ke Vercel

Backend repo ini sekarang sudah disiapkan untuk Vercel melalui:

- [backend/api/index.ts](D:/projects/counseling-ai/backend/api/index.ts:1)
- [backend/vercel.json](D:/projects/counseling-ai/backend/vercel.json:1)

### Langkah 1. Push repository ke GitHub

Pastikan perubahan terbaru sudah ada di repository GitHub Anda.

### Langkah 2. Import backend ke Vercel

1. Buka [Vercel](https://vercel.com/)
2. Klik `Add New Project`
3. Pilih repository `counseling-ai`
4. Saat konfigurasi project, isi:
   - `Root Directory`: `backend`
   - `Build Command`: `npm run vercel-build`

### Langkah 3. Tambahkan environment variables backend

Isi minimal berikut di Vercel:

```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-project.vercel.app
DATABASE_URL=postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
JWT_SECRET=your-long-access-secret
JWT_REFRESH_SECRET=your-long-refresh-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

Tambahan opsional:

```env
REDIS_URL=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GEMINI_API_KEY=
OPENAI_API_KEY=
GITHUB_MODELS_TOKEN=
```

Catatan:

- `REDIS_URL` boleh dikosongkan jika Anda belum punya Redis
- backend akan tetap hidup untuk HTTP API biasa
- fitur blacklist token via Redis akan menjadi nonaktif saat Redis tidak dipakai

### Langkah 4. Deploy backend

Klik `Deploy`.

Setelah sukses, Anda akan mendapatkan URL seperti:

```text
https://your-backend-project.vercel.app
```

### Langkah 5. Uji endpoint backend

Tes endpoint berikut:

- `GET /health`
- `POST /api/v1/auth/login`
- endpoint lain yang memang Anda pakai di frontend

Contoh URL health check:

```text
https://your-backend-project.vercel.app/health
```

### Keterbatasan backend di Vercel

- Socket.IO server di [backend/src/server.ts](D:/projects/counseling-ai/backend/src/server.ts:1) tidak menjadi jalur utama deployment ini
- request yang sangat lama tidak cocok untuk serverless
- upload file lokal `backend/uploads` tidak direkomendasikan untuk production di Vercel

---

## 8. Jika Ingin Benar-Benar Memakai Supabase sebagai Backend

Ini bagian paling penting.

Karena backend sekarang adalah Express app, Anda perlu mengubah pola akses data dari:

- frontend -> Express API -> database

menjadi:

- frontend -> Supabase langsung
- atau frontend -> Supabase Edge Function -> database

### Yang perlu dipindah

Fitur-fitur berikut paling cocok dipindah ke Supabase:

- login dan register
- profile user
- data assessment
- journal
- notifications sederhana
- upload file

### Yang perlu ditinjau ulang

Fitur berikut tidak ideal jika langsung dipindah tanpa refactor:

- Redis-based logic
- Socket.IO realtime server
- custom JWT refresh token flow
- middleware Express yang kompleks
- upload lokal `backend/uploads`

### Rekomendasi migrasi bertahap

1. Pindahkan database ke Supabase lebih dulu
2. Pindahkan upload file ke Supabase Storage
3. Pindahkan auth ke Supabase Auth
4. Ganti request frontend dari `VITE_API_URL` ke client Supabase
5. Pindahkan endpoint yang benar-benar perlu ke Edge Functions
6. Nonaktifkan fitur Redis/Socket.IO sementara jika tidak wajib

---

## 8. Menggunakan Supabase Auth

Kalau Anda ingin gratis dan lebih simpel, Supabase Auth sangat membantu.

### Keuntungan

- tidak perlu maintain login/register backend sendiri
- email verification sudah disediakan
- session management lebih mudah
- integrasi frontend ke Vercel lebih simpel

### Konsekuensi untuk repo ini

Backend saat ini punya:

- auth routes sendiri
- refresh token sendiri
- OTP/password reset flow sendiri

Kalau pindah ke Supabase Auth, maka bagian ini perlu disesuaikan:

- [backend/src/routes/auth.routes.ts](D:/projects/counseling-ai/backend/src/routes/auth.routes.ts:1)
- [backend/src/services/auth.service.ts](D:/projects/counseling-ai/backend/src/services/auth.service.ts:1)
- [frontend/src/store/slices/authSlice.ts](D:/projects/counseling-ai/frontend/src/store/slices/authSlice.ts:1)

Untuk MVP, Anda bisa memilih:

1. tetap pakai auth lama dan host backend di tempat lain
2. pindah penuh ke Supabase Auth dan sederhanakan arsitektur

Jika target Anda benar-benar gratis, opsi 2 lebih cocok.

---

## 9. Menggunakan Supabase Storage untuk Upload

Backend sekarang masih melayani upload lokal dari:

- [backend/src/app/index.ts](D:/projects/counseling-ai/backend/src/app/index.ts:1)
- folder `backend/uploads/`

Di hosting gratis, local file storage seperti ini tidak stabil. Solusi yang lebih tepat:

- buat bucket di Supabase Storage
- upload file dari frontend atau Edge Function
- simpan URL file ke database

### Langkah singkat

1. Di Supabase buka `Storage`
2. Buat bucket, misalnya `avatars`
3. Tentukan bucket public atau private
4. Simpan path file di tabel user/file

Untuk deployment gratis, ini jauh lebih aman daripada mengandalkan folder lokal.

---

## 10. Menyiapkan Frontend untuk Vercel

Frontend berada di folder:

- [frontend/package.json](D:/projects/counseling-ai/frontend/package.json:1)

Script build saat ini:

```json
"build": "tsc -b && vite build"
```

### Environment variable frontend

Untuk frontend, buat env production di Vercel:

```env
VITE_API_URL=https://your-backend-url/api/v1
```

Tetapi jika Anda sudah pindah ke Supabase langsung, maka Anda kemungkinan akan lebih butuh:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Catatan penting

Karena frontend sekarang masih memakai `axios` ke backend custom, ada dua kemungkinan:

1. `VITE_API_URL` tetap dipakai jika Anda masih punya backend API
2. frontend diubah agar memakai Supabase client langsung

Kalau target Anda 100% gratis dengan Supabase + Vercel, sebaiknya arahkan project ke kemungkinan nomor 2.

---

## 11. Deploy Frontend ke Vercel

### Langkah 1. Push project ke GitHub

Pastikan repository sudah ada di GitHub.

### Langkah 2. Import project ke Vercel

1. Buka [Vercel](https://vercel.com/)
2. Klik `Add New Project`
3. Pilih repository `counseling-ai`

### Langkah 3. Atur root directory

Karena frontend ada di subfolder, isi:

- `Root Directory`: `frontend`

### Langkah 4. Atur konfigurasi build

Gunakan konfigurasi berikut:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### Langkah 5. Isi environment variables

Jika frontend masih memakai backend API:

```env
VITE_API_URL=https://backend-anda/api/v1
```

Jika frontend sudah memakai Supabase langsung:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

### Langkah 6. Deploy

Klik `Deploy`.

Setelah selesai, Vercel akan memberi domain seperti:

```text
https://counseling-ai.vercel.app
```

### Langkah 7. Tambahkan domain custom opsional

Kalau Anda punya domain sendiri:

1. buka menu `Domains`
2. tambahkan domain
3. ikuti DNS record yang diminta Vercel

---

## 12. Routing SPA di Vercel

Karena frontend memakai React Router, Anda perlu memastikan refresh halaman tidak menghasilkan `404`.

Tambahkan file:

- `frontend/vercel.json`

Isi:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Ini penting untuk route seperti:

- `/login`
- `/dashboard`
- `/profile`

agar tetap mengarah ke aplikasi React.

---

## 13. Environment Variable yang Direkomendasikan

### Jika masih memakai backend Express

#### Backend `.env`

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://nama-project.vercel.app
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
REDIS_URL=redis://host-redis:6379
JWT_SECRET=secret-panjang
JWT_REFRESH_SECRET=secret-panjang-lain
```

#### Frontend env di Vercel

```env
VITE_API_URL=https://backend-anda/api/v1
```

### Jika frontend langsung ke Supabase

#### Frontend env di Vercel

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

---

## 14. Langkah Deploy yang Disarankan

Untuk skenario gratis, urutan paling aman:

1. buat project Supabase
2. hubungkan Prisma ke database Supabase
3. push schema Prisma
4. siapkan bucket storage jika perlu upload
5. putuskan auth tetap custom atau pindah ke Supabase Auth
6. sesuaikan frontend env
7. deploy frontend ke Vercel
8. uji login, fetch data, upload, dan route halaman

---

## 15. Checklist Pengujian Setelah Deploy

Setelah deployment selesai, cek hal-hal berikut:

- halaman frontend terbuka dari domain Vercel
- refresh halaman selain root tidak `404`
- koneksi ke database Supabase berhasil
- tabel Prisma terbaca normal
- login berhasil
- profile user bisa diambil
- upload file berhasil jika sudah pakai Storage
- tidak ada key rahasia yang bocor ke frontend

---

## 16. Troubleshooting

### Frontend deploy sukses tapi data tidak muncul

Kemungkinan:

- `VITE_API_URL` salah
- frontend sebenarnya perlu `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
- frontend masih memanggil backend Express yang belum di-host

### Prisma gagal konek ke Supabase

Kemungkinan:

- `DATABASE_URL` salah
- password database salah
- memakai connection string yang tidak cocok untuk Prisma

Solusi:

- coba direct connection string
- kalau perlu gunakan pooled connection sesuai saran Supabase

### Login tidak jalan

Kemungkinan:

- frontend masih mengarah ke auth backend lama
- Anda sudah berniat pindah ke Supabase Auth tapi frontend belum diubah

### Upload file gagal

Kemungkinan:

- project masih mengandalkan `backend/uploads`
- hosting gratis tidak menyimpan file lokal secara persisten

Solusi:

- pindahkan upload ke Supabase Storage

### Realtime chat tidak jalan

Kemungkinan:

- project masih bergantung pada Socket.IO server
- Supabase tidak menjalankan Express WebSocket server Anda

Solusi:

- ganti ke Supabase Realtime
- atau host server realtime terpisah

---

## 17. Rekomendasi Praktis untuk Project Ini

Kalau tujuan Anda adalah:

### Demo cepat dan gratis

Pilih ini:

- frontend di Vercel
- database di Supabase
- auth di Supabase
- storage di Supabase
- nonaktifkan sementara fitur yang butuh Redis atau Socket.IO

### Tetap mempertahankan seluruh backend saat ini

Pilih ini:

- frontend di Vercel
- database di Supabase
- backend Express di platform lain
- Redis di platform lain

### Mau full gratis dan sederhana

Pilih ini:

- refactor frontend agar memakai Supabase client
- pindahkan logika inti ke Supabase
- jadikan folder `backend/` sebagai referensi migrasi, bukan server utama

---

## 18. Kesimpulan

Untuk repository ini, kalimat yang paling akurat adalah:

- **Vercel sangat cocok untuk frontend**
- **Supabase sangat cocok untuk database, auth, storage, dan function backend ringan**
- **Supabase tidak cocok untuk menjalankan server Express backend ini apa adanya**

Jadi jika Anda ingin backend benar-benar "menggunakan Supabase", maka langkah yang tepat adalah:

1. pindahkan database ke Supabase
2. pindahkan auth dan storage ke Supabase
3. ubah frontend agar terhubung ke Supabase
4. pindahkan logic tertentu ke Edge Functions bila perlu

Jika Anda mau, langkah berikutnya yang paling membantu adalah saya bisa lanjutkan dengan salah satu dari 3 opsi ini:

1. membuat **versi dokumentasi yang lebih singkat untuk laporan/skripsi**
2. menyiapkan **`frontend/vercel.json` dan template env Supabase**
3. membantu **refactor frontend agar langsung terhubung ke Supabase**
