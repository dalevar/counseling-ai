# Dokumentasi Backend EduCouns AI

Selamat datang di dokumentasi resmi backend **EduCouns AI**. Sistem backend ini dirancang menggunakan Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, JWT Authentication, Redis, Socket.IO, dan integrasi Google Gemini API.

Dokumen ini mencakup panduan dari instalasi awal, struktur arsitektur, pengujian (testing), hingga langkah-langkah deployment ke lingkungan produksi (production-ready).

---

## 1. Spesifikasi Stack & Prasyarat (Prerequisites)

### Stack Teknologi

- **Runtime**: Node.js v20.x atau lebih tinggi (LTS direkomendasikan)
- **Framework**: Express.js dengan TypeScript
- **Database**: PostgreSQL 15+ (Relational Database)
- **Caching & Blacklist**: Redis (Token blacklist & real-time cache)
- **ORM**: Prisma ORM
- **Authentication**: JWT (Access Token & Refresh Token Rotation)
- **Real-Time Communication**: Socket.IO
- **AI Engine**: Google Gemini API (REST client)
- **Upload Storage**: Multer & Cloudinary (dengan fallback ke Local Storage)
- **Mail Service**: Nodemailer (untuk pengiriman OTP verifikasi & reset password)
- **Testing**: Jest & Supertest

### Persyaratan Sistem

Sebelum memulai, pastikan perangkat Anda telah terinstal:

- [Node.js](https://nodejs.org/) (v20.x+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Opsional, sangat direkomendasikan untuk PostgreSQL & Redis local)
- [PostgreSQL Client](https://www.postgresql.org/) (jika diinstal secara native)
- [Redis Server](https://redis.io/) (jika diinstal secara native)

---

## 2. Struktur Direktori Proyek

Proyek ini mengikuti arsitektur berlapis (layered architecture) yang bersih untuk menjaga skalabilitas dan kemudahan pengujian.

```
src/
├── ai/                         # Konfigurasi LLM & Prompt Engineering
│   ├── llm.service.ts          # Integrasi Gemini REST API & Mock Provider
│   └── prompts.ts              # Template Prompt AI (Chat, Emotion, Risk, Summarize)
├── app/
│   └── index.ts                # Inisialisasi Express & Register Middleware/Routes
├── config/
│   └── index.ts                # Loader & Validasi Environment Variables
├── controllers/                # Layer Controller (Parsing req/res, memanggil Service)
├── database/
│   └── prisma/
│       ├── schema.prisma       # Skema Relasional Database Prisma
│       └── migrations/         # Log Migrasi Database
├── helpers/                    # Helper global (Response, Pagination, Query Parser)
├── middleware/                 # Middleware Express (Auth, Error, Rate Limiting, Validation)
├── repositories/               # Layer Data Access (Interaksi langsung ke Database/Prisma)
├── routes/                     # Router Express untuk mapping endpoint ke Controller
├── services/                   # Layer Bisnis Logika utama sistem
├── sockets/                    # Handler Event Real-time Socket.IO (Chat & Live Notification)
├── tests/                      # Suite Integration Testing (Jest & Supertest)
├── types/                      # File TypeScript Declaration (*.d.ts)
├── utils/                      # Utilities (Logger Winston, Redis Client, Prisma Client)
├── server.ts                   # Entry point aplikasi (HTTP Server & Socket.IO Listener)
└── package.json                # Pengaturan dependensi & NPM scripts
```

---

## 3. Instalasi dan Setup Lokal

Ikuti langkah-langkah berikut untuk menjalankan server di mesin lokal Anda:

### Langkah 1: Kloning Proyek & Instal Dependensi

Ekstrak atau kloning proyek ke direktori kerja Anda, lalu jalankan perintah berikut:

```bash
npm install
```

### Langkah 2: Konfigurasi Environment Variables (`.env`)

Buat file `.env` di root direktori proyek Anda (gunakan file `.env.example` sebagai referensi). Sesuaikan nilainya dengan konfigurasi lokal Anda:

```ini
# App Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5433/educouns_db?schema=public"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET=super-secret-access-token-key-change-in-production
JWT_REFRESH_SECRET=super-secret-refresh-token-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# LLM APIs
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=mock_key_openai

# Email (SMTP) Configuration
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password
EMAIL_FROM="EduCouns AI <no-reply@educouns.ai>"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Langkah 3: Menjalankan Database & Redis Melalui Docker (Direkomendasikan)

Gunakan `docker-compose.yml` yang tersedia untuk mempermudah setup PostgreSQL & Redis secara instan:

```bash
docker-compose up -d
```

_Perintah ini akan menjalankan PostgreSQL pada port `5433` dan Redis pada port `6379` di background._

### Langkah 4: Sinkronisasi Database (Prisma db push / migrate)

Jalankan perintah berikut untuk mensinkronisasikan skema Prisma ke database PostgreSQL lokal Anda dan men-generate Prisma Client:

```bash
npx prisma db push --schema=src/database/prisma/schema.prisma
```

### Langkah 5: Menjalankan Aplikasi dalam Mode Development

Gunakan nodemon untuk memantau perubahan file secara otomatis:

```bash
npm run dev
```

Aplikasi akan aktif di `http://localhost:5000`. Endpoint dasar API adalah `http://localhost:5000/api/v1`.

---

## 4. Pengujian (Testing)

Proyek ini dilengkapi dengan suite pengujian integrasi menggunakan Jest dan Supertest untuk memastikan keandalan alur bisnis inti.

### Konfigurasi Uji

Secara otomatis, suite pengujian akan mengisolasi database pengujian dan menggunakan `MockLLMProvider` agar pengujian berjalan cepat, deterministik, dan tanpa menghabiskan kuota API key eksternal.

### Menjalankan Pengujian

Untuk menjalankan seluruh suite pengujian integrasi, jalankan perintah:

```bash
npm run test
```

### Hasil Test Suite

Pengujian mencakup 4 file integrasi utama:

1. `auth.test.ts`: Registrasi, Verifikasi OTP email, Login JWT.
2. `user.test.ts`: Akses profil, pembaruan profil siswa, unggah foto avatar.
3. `counseling.test.ts`: Pemesanan sesi konseling, validasi bentrok jadwal (scheduling clash), persetujuan konselor, penginputan catatan klinis, dan penilaian umpan balik (feedback).
4. `ai.test.ts`: Chat AI dua arah, analisis emosi, deteksi risiko keselamatan diri (safety filter), ringkasan percakapan, dan kuesioner PHQ-9 / GAD-7.

---

## 5. Ringkasan Endpoint API Utama

Semua endpoint API diawali dengan `/api/v1`. Semua permintaan mutasi (`POST`, `PUT`, `PATCH`, `DELETE`) dilindungi oleh middleware validasi Zod untuk memastikan keamanan data masukan.

### Autentikasi (`/auth`)

- `POST /auth/register` : Registrasi akun baru (Siswa, Konselor, dll.). Mengirimkan OTP ke email.
- `POST /auth/verify-otp` : Memverifikasi kode OTP untuk mengaktifkan akun.
- `POST /auth/login` : Login dengan email & password. Mengembalikan Access Token & Refresh Token.
- `POST /auth/refresh-token` : Rotasi token dengan Refresh Token lama.
- `POST /auth/logout` : Logout aman. Memasukkan Access Token saat ini ke daftar blacklist Redis.
- `POST /auth/forgot-password` : Mengirimkan kode reset password ke email terdaftar.
- `POST /auth/reset-password` : Mereset password menggunakan kode OTP baru.

### Manajemen Pengguna (`/users`)

- `GET /users/me` : Mendapatkan profil detail pengguna yang sedang login.
- `PUT /users/me/student` : Memperbarui data spesifik profil siswa (hanya peran Siswa).
- `POST /users/me/avatar` : Mengunggah gambar avatar (menyimpan di Cloudinary jika diset, atau fallback ke sistem lokal `/uploads/avatars`).

### Sistem Konseling (`/counseling`)

- `POST /counseling` : Memesan sesi konseling (Otomatis memvalidasi bentrok jadwal dan membuat link rapat online via Jitsi Meet).
- `GET /counseling` : Melihat daftar sesi konseling saat ini (dengan pagination & filter status).
- `GET /counseling/:id` : Detail lengkap sesi.
- `PUT /counseling/:id/status` : Mengubah status sesi (`APPROVED`, `ONGOING`, `COMPLETED`, `CANCELLED`). Hanya untuk pengguna yang berwenang.
- `PUT /counseling/:id/notes` : Menambahkan catatan klinis/konseling (Hanya dapat diakses oleh Konselor/Guru).
- `PUT /counseling/:id/feedback` : Mengirimkan skor rating (1-5) dan review dari siswa setelah sesi berstatus `COMPLETED`. Mengakibatkan pembaruan otomatis rata-rata rating konselor di database.

### Modul Kecerdasan Buatan (`/ai`)

- `POST /ai/chat` : Berinteraksi dengan agen asisten AI konseling (Membawa konteks 10 percakapan terakhir).
- `POST /ai/analyze-emotion` : Analisis instan emosi dominan dan kata kunci teks.
- `POST /ai/assess-risk` : Analisis tingkat bahaya/krisis teks.
- `POST /ai/recommendations` : Meminta saran coping strategy psikologis.
- `POST /ai/assessment` : Mengirimkan jawaban asesmen PHQ-9 (depresi) atau GAD-7 (kecemasan). Mengembalikan skor kumulatif, keparahan klinis, dan saran coping otomatis.
- `GET /ai/assessment/history` : Riwayat tes kesehatan mental siswa.
- `GET /ai/conversations` : Daftar riwayat chat dengan AI.
- `DELETE /ai/conversations/:id` : Soft-delete percakapan AI.
- `POST /ai/conversations/:id/summarize` : Membuat ringkasan klinis otomatis dari sesi percakapan dengan AI.

### Jurnal & Mood (`/journals`)

- `POST /journals` : Membuat catatan jurnal harian (Otomatis mendeteksi sentimen teks).
- `GET /journals` : Mendapatkan daftar jurnal dengan pencarian & pagination.
- `POST /journals/mood` : Mencatat skor emosi harian (1-5) dengan deteksi emosi teks otomatis pada catatan tambahan.
- `GET /journals/mood/stats` : Mendapatkan ringkasan statistik (rata-rata mood, skor minimum/maksimum, dan indikator tren mood (membaik/stabil/menurun)).

### Notifikasi (`/notifications`)

- `GET /notifications` : Memuat daftar pemberitahuan pengguna (?unread=true).
- `GET /notifications/unread-count` : Menghitung jumlah notifikasi yang belum dibaca.
- `PATCH /notifications/:id/read` / `/read-all` : Menandai pemberitahuan sebagai telah dibaca.

### Dashboard Admin (`/admin`)

- `GET /admin/stats` : KPI statistik platform (jumlah pengguna, sesi aktif, rata-rata mood, dll.).
- `GET /admin/users` : Daftar seluruh akun pengguna beserta filter peran dan pencarian kata kunci.
- `PATCH /admin/users/:id/status` : Mengaktifkan atau menangguhkan (suspend) akun pengguna.
- `GET /admin/risk-alerts` : Alert khusus menampilkan percakapan AI siswa yang terdeteksi memiliki level risiko `high` atau `critical` untuk ditindaklanjuti secara fisik oleh konselor nyata.

---

## 6. Panduan Deployment Produksi (Production Deployment)

Sistem backend ini siap diproduksi dan dapat di-deploy menggunakan beberapa metode berikut:

### Opsi A: Deployment Tradisional dengan PM2 (Bare-Metal/VPS)

1. **Persiapkan Server VPS**: Hubungkan VPS Anda (Ubuntu 22.04 LTS direkomendasikan).
2. **Instal Node.js & Database**: Instal Node.js v20, Redis, dan PostgreSQL di VPS, atau gunakan managed service.
3. **Kloning Repositori**: Unduh kode sumber ke server.
4. **Instal PM2 Secara Global**:
   ```bash
   npm install -g pm2
   ```
5. **Buat File Produksi `.env`**: Salin konfigurasi dan pastikan `NODE_ENV=production`. Gunakan key JWT dan API yang sangat aman.
6. **Lakukan Build Project**:
   Aplikasi ditulis dalam TypeScript, lakukan kompilasi ke JavaScript bersih (`dist/`):
   ```bash
   npm run build
   ```
7. **Jalankan Database Migration**:
   ```bash
   npx prisma migrate deploy --schema=src/database/prisma/schema.prisma
   ```
8. **Jalankan Aplikasi Menggunakan PM2**:
   ```bash
   pm2 start dist/server.js --name "educouns-backend"
   pm2 save
   pm2 startup
   ```

---

### Opsi B: Deployment Container dengan Docker (Sangat Direkomendasikan)

Proyek ini telah dilengkapi dengan Dockerfile multi-stage untuk meminimalkan ukuran image produksi akhir.

1. **Build Docker Image**:
   ```bash
   docker build -t educouns-backend:latest .
   ```
2. **Jalankan Container**:
   Jalankan container dengan memetakan file `.env` produksi:
   ```bash
   docker run -d -p 5000:5000 --env-file .env --name educouns-app educouns-backend:latest
   ```

Atau gunakan file `docker-compose.production.yml` untuk menggabungkan aplikasi, database PostgreSQL, dan Redis dalam jaringan internal yang aman:

```yaml
version: '3.8'

services:
  app:
    image: educouns-backend:latest
    build: .
    restart: always
    ports:
      - '5000:5000'
    env_file:
      - .env
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always

volumes:
  pgdata:
```

_Jalankan dengan perintah: `docker-compose -f docker-compose.production.yml up -d`._

---

## 7. Check-list Keamanan & Pemeliharaan Produksi

Sebelum merilis sistem ke publik, pastikan Anda memenuhi daftar periksa berikut:

- [ ] **HTTPS / SSL**: Pastikan API dideploy di bawah protokol HTTPS (gunakan Cloudflare SSL atau Let's Encrypt dengan Nginx reverse proxy).
- [ ] **Kunci Rahasia (Secrets)**: Pastikan `JWT_SECRET` dan `JWT_REFRESH_SECRET` menggunakan string acak dengan entropi tinggi (minimal 64 karakter).
- [ ] **CORS Origin**: Batasi origin `FRONTEND_URL` hanya ke domain produksi aplikasi web Anda, jangan gunakan `*`.
- [ ] **Rate Limiting**: Lindungi backend dari brute-force dan serangan DDoS. Skrip ini telah menyematkan limiter pada route `/api/v1/auth` dan `/api/v1/ai/chat` secara default.
- [ ] **Backup Database**: Jadwalkan cron job otomatis harian untuk melakukan dump database menggunakan `pg_dump`.
- [ ] **Monitoring Log**: Pasang logger ke aggregator pihak ketiga (misalnya Loggly, Papertrail, atau Datadog) untuk memantau error log yang ditulis oleh Winston secara real-time.

## 8. Dummy Account

Saya telah berhasil membuat dan memasukkan 15 akun dummy (masing-masing 5 untuk Admin, Guru BK, dan Siswa) ke dalam database.

Semua akun ini memiliki kata sandi (password) yang sama untuk memudahkan pengujian:
🔑 Password Bersama: SandiPalsu123
Berikut adalah rincian data akun yang telah siap digunakan:

1. 🛡️ Akun Admin (Administrator)
   No Nama Admin Alamat Email Peran
   1 Admin Utama admin1@educouns.ai ADMIN
   2 Admin Sektor Satu admin2@educouns.ai ADMIN
   3 Admin Sektor Dua admin3@educouns.ai ADMIN
   4 Admin Sektor Tiga admin4@educouns.ai ADMIN
   5 Admin Super admin5@educouns.ai ADMIN

2. 🧑‍🏫 Akun Guru BK (Teacher)
   No Nama Lengkap Alamat Email NIP (ID Karyawan) Peran
   1 Sri Wahyuni guru1@bk.sch.id 198001012005012001 TEACHER
   2 Budi Santoso guru2@bk.sch.id 198202022006021002 TEACHER
   3 Rina Marliani guru3@bk.sch.id 198503032007032003 TEACHER
   4 Hendra Gunawan guru4@bk.sch.id 198804042008041004 TEACHER
   5 Lia Kusumawati guru5@bk.sch.id 199005052009052005 TEACHER

3. 🎓 Akun Siswa (Student)
   No Nama Lengkap Alamat Email Jenis Kelamin No. Telepon Peran
   1 Annisa Rahmawati siswa1@student.sch.id Perempuan (P) 081211111111 STUDENT
   2 Dimas Pratama siswa2@student.sch.id Laki-laki (L) 081222222222 STUDENT
   3 Siti Nuraini siswa3@student.sch.id Perempuan (P) 081233333333 STUDENT
   4 Ahmad Fauzi siswa4@student.sch.id Laki-laki (L) 081244444444 STUDENT
   5 Rian Hidayat siswa5@student.sch.id Laki-laki (L) 081255555555 STUDENT
