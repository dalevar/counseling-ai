# EduCouns AI — Frontend

> Platform e-counseling berbasis kecerdasan buatan untuk pelajar Indonesia.

## 🚀 Quick Start

### Persyaratan
- Node.js ≥ 20.0.0 LTS
- npm ≥ 10.0.0

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/your-org/counseling-ai.git
cd counseling-ai/frontend

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Setup environment variables
copy .env.example .env    # Windows
cp .env.example .env      # macOS/Linux

# 4. Edit .env sesuai kebutuhan
# VITE_API_URL=http://localhost:5000/api/v1

# 5. Jalankan development server
npm run dev
```

Aplikasi berjalan di: **http://localhost:5173**

---

## 📋 Scripts

| Script | Perintah | Deskripsi |
|---|---|---|
| Development | `npm run dev` | Dev server dengan HMR |
| Build | `npm run build` | Type check + production bundle |
| Preview | `npm run preview` | Preview hasil build lokal |
| Lint | `npm run lint` | Jalankan OxLint |
| Test | `npm test` | Jalankan Vitest (watch mode) |

---

## 🗂️ Struktur Proyek

```
src/
├── api/            # Axios client + interceptors
├── components/ui/  # Design System (Button, Card, Badge, dll.)
├── hooks/          # Custom hooks (store, usePWAInstall)
├── layouts/        # AuthLayout, DashboardLayout
├── pages/          # Semua halaman aplikasi
├── providers/      # ThemeProvider (Dark/Light mode)
├── routes/         # React Router DOM config
├── store/          # Redux + redux-persist
└── styles/         # globals.css (Tailwind v4 @theme tokens)
```

---

## 🛣️ Routes

| Path | Halaman |
|---|---|
| `/login` | Login |
| `/register` | Register |
| `/dashboard/student` | Dashboard Siswa |
| `/ai-chat` | Chat AI |
| `/counseling` | Booking Konseling |
| `/assessment` | Asesmen Psikologis |
| `/mood` | Mood & Jurnal |
| `/forum` | Forum Diskusi |
| `/articles` | Artikel Edukasi |
| `/notifications` | Notifikasi |
| `/admin/users` | Manajemen Pengguna |
| `/admin/system` | Monitor Sistem |

---

## 🔑 Environment Variables

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=EduCouns AI
```

---

## 🏗️ Build & Deploy

```bash
# Build production
npm run build

# Output ada di dist/ — deploy ke Vercel
```

Untuk deployment monorepo ini di Vercel:

- project frontend gunakan root directory `frontend`
- set `VITE_API_URL=https://your-backend-project.vercel.app/api/v1`
- file [frontend/vercel.json](D:/projects/counseling-ai/frontend/vercel.json:1) sudah menambahkan rewrite untuk React Router SPA

Lihat [**Dokumentasi Lengkap**](./docs/FRONTEND_DOCUMENTATION.md) dan [DEPLOYMENT_GUIDE.md](D:/projects/counseling-ai/DEPLOYMENT_GUIDE.md:1) untuk panduan Supabase + Vercel yang lebih lengkap.

---

## 🧪 Testing

```bash
npm test              # Watch mode
npx vitest run        # Single run (CI)
npm run test:coverage # Coverage report
```

---

## 📦 Stack Teknologi

React 19 · TypeScript · Vite · Tailwind CSS v4 · Redux Toolkit · React Router DOM · Axios · TanStack Query · Framer Motion · Recharts · Socket.IO · PWA

---

## 📄 Lisensi

MIT © 2026 EduCouns AI Team
