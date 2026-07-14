# EduCouns AI — Frontend Documentation

> Dokumentasi lengkap untuk instalasi, pengembangan, testing, dan deployment aplikasi frontend **EduCouns AI**.

---

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Persyaratan Sistem](#2-persyaratan-sistem)
3. [Instalasi & Setup Awal](#3-instalasi--setup-awal)
4. [Struktur Proyek](#4-struktur-proyek)
5. [Arsitektur Aplikasi](#5-arsitektur-aplikasi)
6. [Environment Variables](#6-environment-variables)
7. [Design System & Komponen UI](#7-design-system--komponen-ui)
8. [State Management (Redux)](#8-state-management-redux)
9. [Routing & Navigasi](#9-routing--navigasi)
10. [API Client & Interceptors](#10-api-client--interceptors)
11. [Fitur & Halaman](#11-fitur--halaman)
12. [PWA Configuration](#12-pwa-configuration)
13. [Testing](#13-testing)
14. [Build untuk Production](#14-build-untuk-production)
15. [Deployment](#15-deployment)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Gambaran Umum

**EduCouns AI** adalah platform e-counseling berbasis kecerdasan buatan yang ditujukan untuk pelajar Indonesia. Aplikasi ini memungkinkan siswa untuk:

- Chat dengan AI konselor kapan saja (24/7)
- Melakukan asesmen psikologis tervalidasi (PHQ-9, GAD-7, DASS-21)
- Mencatat dan memantau mood harian melalui jurnal
- Menjadwalkan sesi konseling dengan Guru BK atau Psikolog Klinis
- Berpartisipasi di forum diskusi sesama pelajar
- Membaca artikel edukasi kesehatan mental

### Stack Teknologi

| Kategori | Teknologi | Versi |
|---|---|---|
| UI Framework | React | 19.x |
| Bahasa | TypeScript | ~6.0.2 |
| Build Tool | Vite | ^8.1.1 |
| Styling | Tailwind CSS | ^4.3.2 |
| State Management | Redux Toolkit + redux-persist | ^2.12.0 |
| Data Fetching | Axios + TanStack React Query | ^5.x |
| Routing | React Router DOM | ^7.18.1 |
| Animasi | Framer Motion | ^12.x |
| Chart | Recharts | ^3.9.2 |
| Form | React Hook Form + Zod | ^7.x / ^4.x |
| Realtime | Socket.IO Client | ^4.8.3 |
| PWA | Native Service Worker + Web App Manifest | — |
| Linter | OxLint | ^1.71.0 |

---

## 2. Persyaratan Sistem

### Wajib

| Tools | Versi Minimum | Catatan |
|---|---|---|
| **Node.js** | ≥ 20.0.0 LTS | Direkomendasikan v22 LTS |
| **npm** | ≥ 10.0.0 | Sudah termasuk dalam Node.js |
| **Git** | ≥ 2.x | Untuk clone repository |

### Opsional tapi Direkomendasikan

| Tools | Kegunaan |
|---|---|
| **VS Code** | Editor dengan dukungan TypeScript & Tailwind terbaik |
| **VS Code Extensions** | `ESLint`, `Tailwind CSS IntelliSense`, `Prettier`, `Auto Import` |
| **Google Chrome / Edge** | Untuk debugging PWA dan DevTools terbaik |

### Cek versi yang terpasang:
```bash
node --version   # Harus >= v20.0.0
npm --version    # Harus >= 10.0.0
git --version
```

---

## 3. Instalasi & Setup Awal

### 3.1 Clone Repository

```bash
git clone https://github.com/your-org/counseling-ai.git
cd counseling-ai/frontend
```

### 3.2 Install Dependencies

```bash
npm install --legacy-peer-deps
```

> Proses ini akan menginstall seluruh 28+ packages (dependencies + devDependencies).

### 3.3 Setup Environment Variables

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Edit `.env` dan sesuaikan nilai variabel (lihat [Bagian 6](#6-environment-variables)).

### 3.4 Jalankan Development Server

```bash
npm run dev
```

Aplikasi berjalan di: **`http://localhost:5173`**

> Vite mendukung **Hot Module Replacement (HMR)** — perubahan kode terlihat langsung tanpa refresh.

---

## 4. Struktur Proyek

```
frontend/
├── public/                     # Static assets (tidak diproses Vite)
│   ├── manifest.json           # PWA Web App Manifest
│   ├── sw.js                   # Service Worker (offline + push notification)
│   ├── favicon.svg
│   └── icons/                  # PWA icons 72x72 → 512x512
│
├── src/
│   ├── api/
│   │   └── client.ts           # Axios instance + JWT interceptors
│   │
│   ├── components/
│   │   └── ui/                 # Reusable Design System components
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── skeleton.tsx
│   │       └── spinner.tsx
│   │
│   ├── hooks/
│   │   ├── store.ts            # Typed Redux hooks
│   │   └── usePWAInstall.ts    # PWA install prompt hook
│   │
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx # Sidebar + Topbar + PWA banner
│   │
│   ├── pages/
│   │   ├── auth/               # SplashScreen, Onboarding, Login, Register, dll.
│   │   ├── dashboard/          # 5 role dashboards
│   │   ├── profile/            # Profile & Settings (4 tab)
│   │   ├── chat/               # AI Chat
│   │   ├── counseling/         # Booking Konseling
│   │   ├── assessment/         # Asesmen Psikologis
│   │   ├── mood/               # Mood Tracking & Jurnal
│   │   ├── forum/              # Forum Diskusi
│   │   ├── articles/           # Artikel Edukasi
│   │   ├── notifications/      # Pusat Notifikasi
│   │   └── admin/              # UserManagement + SystemStats
│   │
│   ├── providers/
│   │   └── ThemeProvider.tsx   # Dark/Light mode context
│   │
│   ├── routes/
│   │   └── index.tsx           # Semua route definitions
│   │
│   ├── store/
│   │   ├── index.ts            # Redux store + persist config
│   │   └── slices/
│   │       └── authSlice.ts    # Auth state (token, user, role)
│   │
│   ├── styles/
│   │   └── globals.css         # Design tokens + Tailwind @theme
│   │
│   ├── App.tsx
│   └── main.tsx                # Entry point
│
├── docs/
│   └── FRONTEND_DOCUMENTATION.md  # Dokumen ini
│
├── index.html                  # HTML shell + SEO + PWA + SW registration
├── vite.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── package.json
├── .env.example                # Template environment variables
└── .oxlintrc.json
```

---

## 5. Arsitektur Aplikasi

### 5.1 Alur Data

```
Browser / PWA
     │
     ▼
React Router DOM (AuthLayout / DashboardLayout)
     │
     ▼
React Components (Pages → Layouts → UI Components)
     │
     ▼
Redux Store (redux-persist) — authSlice [token, user, role]
     │
     ▼
Axios Client (JWT auto-inject) + TanStack Query (caching)
     │  HTTP / WebSocket
     ▼
Backend API (http://localhost:5000/api)
```

### 5.2 Hierarki Layout

```
App.tsx (RouterProvider)
├── AuthLayout
│   ├── SplashScreen, Onboarding
│   ├── Login, Register
│   └── ForgotPassword, ResetPassword, OTP, EmailVerification
│
└── DashboardLayout (Sidebar + Topbar + PWA Install Banner)
    ├── Dashboard/* (student/teacher/counselor/parent/admin)
    ├── /profile, /settings
    ├── /ai-chat
    ├── /counseling, /assessment, /mood
    ├── /forum, /articles, /notifications
    └── /admin/users, /admin/system
```

### 5.3 Role-Based Navigation

| Role | Menu Sidebar |
|---|---|
| **student** | AI Chat, Konseling, Asesmen, Mood & Jurnal, Forum, Artikel |
| **teacher** | AI Chat, Jadwal Konseling, Forum, Artikel BK |
| **counselor** | AI Chat, Jadwal Konsultasi, Tulis Artikel |
| **parent** | AI Chat, Sesi Anak, Perkembangan Anak |
| **admin** | Manajemen Pengguna, Monitor Sistem, Forum, Artikel |

---

## 6. Environment Variables

Buat file `.env` di `frontend/` (tidak di-commit):

```env
# API Backend
VITE_API_URL=http://localhost:5000/api

# Socket.IO
VITE_SOCKET_URL=http://localhost:5000

# Aplikasi
VITE_APP_NAME=EduCouns AI
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_FORUM=true
VITE_ENABLE_ASSESSMENT=true
```

> **Penting:** Semua variabel harus diawali `VITE_` agar ter-expose ke browser.

Akses di kode:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 7. Design System & Komponen UI

### 7.1 Token Design (globals.css)

```css
@import "tailwindcss";

@theme {
  --color-primary: #6366f1;       /* Indigo */
  --color-secondary: #8b5cf6;     /* Violet */
  --color-background: #0f172a;    /* Dark slate */
  --color-foreground: #f8fafc;
  --color-card: #1e293b;
  --color-border: #334155;
  --color-muted-foreground: #94a3b8;
}
```

### 7.2 Daftar Komponen

| Komponen | Lokasi | Keterangan |
|---|---|---|
| `Button` | `@/components/ui/button` | 7 variants, sizes (sm/md/lg), `isLoading`, `leftIcon`, `rightIcon` |
| `Input` | `@/components/ui/input` | Label, error state, helper text, icon slot |
| `Card` | `@/components/ui/card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` |
| `Badge` | `@/components/ui/badge` | 6 variants: default, secondary, destructive, outline, success, warning |
| `Avatar` | `@/components/ui/avatar` | Circular, fallback initials, sizes: sm/md/lg/xl |
| `Dialog` | `@/components/ui/dialog` | Animated modal (Framer Motion) |
| `Spinner` | `@/components/ui/spinner` | Loading indicator, 3 ukuran |
| `Skeleton` | `@/components/ui/skeleton` | Shimmer placeholder |

### 7.3 Contoh Penggunaan

```tsx
import Button from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Avatar from '@/components/ui/avatar';

// Button
<Button variant="outline" size="sm" isLoading={loading}>
  Simpan
</Button>

// Card
<Card>
  <CardHeader><CardTitle>Judul</CardTitle></CardHeader>
  <CardContent>Isi konten...</CardContent>
</Card>

// Badge
<Badge variant="success">Aktif</Badge>

// Avatar
<Avatar fallback="Sri Wahyuni" size="lg" />
```

---

## 8. State Management (Redux)

### 8.1 Store & Persist

```typescript
// src/store/index.ts
// Hanya 'auth' yang di-persist ke localStorage
// Key: 'educouns-auth'
```

### 8.2 Auth Slice

```typescript
// State shape
interface AuthState {
  user: User | null;     // data user yang login
  token: string | null;  // JWT access token
  isAuthenticated: boolean;
}

// Dispatch actions
dispatch(setCredentials({ user, token }));  // Setelah login berhasil
dispatch(logout());                          // Keluar sesi
```

### 8.3 Typed Hooks (WAJIB digunakan)

```typescript
import { useAppSelector, useAppDispatch } from '@/hooks/store';

// GUNAKAN ini (bukan useSelector/useDispatch langsung)
const dispatch = useAppDispatch();
const { user, isAuthenticated } = useAppSelector((state) => state.auth);
```

---

## 9. Routing & Navigasi

### 9.1 Routes Lengkap

**Auth (`AuthLayout`):**

| Path | Komponen |
|---|---|
| `/splash` | SplashScreen |
| `/onboarding` | Onboarding |
| `/login` | Login |
| `/register` | Register |
| `/forgot-password` | ForgotPassword |
| `/reset-password` | ResetPassword |
| `/otp` | OTP |
| `/email-verification` | EmailVerification |

**Dashboard (`DashboardLayout`):**

| Path | Komponen |
|---|---|
| `/dashboard/student` | StudentDashboard |
| `/dashboard/teacher` | TeacherDashboard |
| `/dashboard/counselor` | CounselorDashboard |
| `/dashboard/parent` | ParentDashboard |
| `/dashboard/admin` | AdminDashboard |

**Fitur (`DashboardLayout`):**

| Path | Komponen |
|---|---|
| `/profile` | Profile |
| `/settings` | Profile (tab Settings) |
| `/ai-chat` | AIChat |
| `/counseling` | Counseling |
| `/assessment` | Assessment |
| `/mood` | MoodTracking |
| `/forum` | Forum |
| `/articles` | Articles |
| `/notifications` | Notifications |
| `/admin/users` | UserManagement |
| `/admin/system` | SystemStats |

### 9.2 Cara Menambah Route Baru

```typescript
// 1. Buat komponen di src/pages/example/ExamplePage.tsx
// 2. Tambah import di src/routes/index.tsx
import ExamplePage from '@/pages/example/ExamplePage';

// 3. Daftarkan di DashboardLayout children:
{ path: 'example', element: <ExamplePage /> },
```

---

## 10. API Client & Interceptors

### 10.1 Penggunaan Dasar

```typescript
import { apiClient } from '@/api/client';

// GET
const { data } = await apiClient.get('/users/profile');

// POST
await apiClient.post('/auth/login', { email, password });

// Dengan TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ['profile'],
  queryFn: () => apiClient.get('/users/profile').then(r => r.data),
});
```

### 10.2 Auto Error Handling

| Status | Penanganan Otomatis |
|---|---|
| `401` | Auto logout + toast "Sesi berakhir" |
| `403` | Toast "Tidak memiliki akses" |
| `500` | Toast "Kesalahan server" |
| Network Error | Toast "Gagal terhubung" |

---

## 11. Fitur & Halaman

| Halaman | Route | Fitur Utama |
|---|---|---|
| **AI Chat** | `/ai-chat` | Sidebar history, Markdown rendering, prompt chips, file upload |
| **Konseling** | `/counseling` | Daftar konselor, booking sesi, riwayat + rating |
| **Asesmen** | `/assessment` | PHQ-9/GAD-7/DASS-21, kuesioner animasi, skor severity |
| **Mood Tracking** | `/mood` | Emoji check-in, jurnal harian, area chart mingguan |
| **Forum** | `/forum` | Feed posting, like/bookmark/share, filter + search |
| **Artikel** | `/articles` | Grid artikel, bookmark, tag, filter + search |
| **Notifikasi** | `/notifications` | Animated dismiss, mark-read, mute semua |
| **User Management** | `/admin/users` | Tabel pengguna, filter, toggle status, delete, pagination |
| **System Stats** | `/admin/system` | Charts API traffic + CPU/RAM, service health, system logs |

---

## 12. PWA Configuration

### 12.1 Service Worker Strategies

| Jenis Request | Strategi |
|---|---|
| Static assets (JS/CSS/Fonts) | **Cache First** |
| API `/api/*` | **Network First** |
| Navigation (halaman baru) | **Network First** + fallback `index.html` |
| Default | **Stale While Revalidate** |

### 12.2 Push Notification Payload

```json
{
  "title": "Sesi Dikonfirmasi",
  "body": "Sesi dengan Sri Wahyuni pukul 10:00",
  "url": "/counseling"
}
```

### 12.3 Install Hook

```tsx
import { usePWAInstall } from '@/hooks/usePWAInstall';

const { canInstall, isInstalling, install } = usePWAInstall();
// canInstall = true → tampilkan tombol install
// install()  → tampilkan native prompt browser
```

---

## 13. Testing

### 13.1 Setup Vitest + React Testing Library

```bash
npm install --save-dev vitest @vitest/ui jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Tambah ke `vite.config.ts`:

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

Buat `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

Tambah scripts ke `package.json`:
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

### 13.2 Contoh Test — Komponen Button

```typescript
// src/components/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Button from '@/components/ui/button';

describe('Button', () => {
  it('merender teks dengan benar', () => {
    render(<Button>Klik Saya</Button>);
    expect(screen.getByText('Klik Saya')).toBeInTheDocument();
  });

  it('memanggil onClick saat diklik', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Klik</Button>);
    await userEvent.click(screen.getByText('Klik'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled saat isLoading = true', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 13.3 Contoh Test — Redux Auth Slice

```typescript
// src/store/slices/__tests__/authSlice.test.ts
import { describe, it, expect } from 'vitest';
import authReducer, { setCredentials, logout } from '@/store/slices/authSlice';

const mockUser = { id: '1', name: 'Test', email: 'test@test.com', role: 'student' };

describe('authSlice', () => {
  it('state awal kosong', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.isAuthenticated).toBe(false);
  });

  it('setCredentials mengisi user dan token', () => {
    const state = authReducer(undefined, setCredentials({ user: mockUser, token: 'jwt' }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('jwt');
  });

  it('logout menghapus semua state', () => {
    const state = authReducer(
      { user: mockUser, token: 'jwt', isAuthenticated: true },
      logout()
    );
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
```

### 13.4 Menjalankan Test

```bash
npm test                # Watch mode
npx vitest run          # Single run (untuk CI)
npm run test:ui         # UI visual Vitest
npm run test:coverage   # Coverage report
```

### 13.5 Checklist QA Manual

**Auth:**
- [ ] Login valid → redirect dashboard
- [ ] Login salah → error message
- [ ] Akses route protected tanpa login → redirect `/login`
- [ ] Logout → state terhapus, redirect `/login`

**Dashboard:**
- [ ] Sidebar menampilkan menu sesuai role
- [ ] Dark/Light mode berfungsi dan tersimpan

**Fitur:**
- [ ] AI Chat: kirim pesan, Markdown ter-render
- [ ] Assessment: progress bar, hitung skor, tampil hasil
- [ ] Forum: like/bookmark update state UI
- [ ] Admin: filter/search/pagination berfungsi

**PWA:**
- [ ] Manifest terdeteksi di Chrome DevTools → Application
- [ ] Service Worker terdaftar
- [ ] Install banner muncul

**Responsif:**
- [ ] Mobile (< 640px): sidebar drawer
- [ ] Tablet (640–1024px): sidebar collapsed
- [ ] Desktop (> 1024px): sidebar penuh

---

## 14. Build untuk Production

```bash
# Type check + bundle
npm run build

# Preview build lokal
npm run preview    # http://localhost:4173
```

**Output:**
```
dist/
├── index.html         (~3.77 kB | gzip: 1.35 kB)
├── assets/
│   ├── index-[hash].css   (~70 kB | gzip: ~11 kB)
│   └── index-[hash].js    (~1.3 MB | gzip: ~385 kB)
└── [public assets]
```

### Optimasi Bundle Size (Opsional)

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-vendor': ['framer-motion', 'lucide-react', 'recharts'],
        'state-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
      },
    },
  },
},
```

---

## 15. Deployment

### 15.1 Vercel (Paling Mudah)

```bash
npm install -g vercel
vercel login
cd frontend
vercel --prod
```

Buat `vercel.json` untuk SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

### 15.2 Netlify

Buat `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

```bash
netlify deploy --prod --dir dist
```

---

### 15.3 Nginx (VPS / Server Linux)

```bash
# 1. Build
npm run build

# 2. Upload ke server
rsync -avz dist/ user@server:/var/www/educouns-frontend/
```

**Konfigurasi Nginx (`/etc/nginx/sites-available/educouns`):**
```nginx
server {
    listen 80;
    server_name app.educouns.ai;
    root /var/www/educouns-frontend;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Cache static assets 1 tahun
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — WAJIB untuk React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
}
```

```bash
# SSL dengan Let's Encrypt
sudo certbot --nginx -d app.educouns.ai
```

---

### 15.4 Docker

**`Dockerfile`:**
```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**`nginx.conf`:**
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```

```bash
docker build --build-arg VITE_API_URL=https://api.educouns.ai/api -t educouns-frontend .
docker run -p 3000:80 educouns-frontend
```

---

### 15.5 GitHub Actions CI/CD

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - run: npm ci

      - run: npm run lint

      - run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 16. Troubleshooting

### `VITE_API_URL` tidak terbaca
**Penyebab:** File `.env` tidak ada atau nama variabel salah.  
**Solusi:** Pastikan `.env` ada di folder `frontend/` dan semua variabel diawali `VITE_`.

### `Cannot find module '@/components/...'`
**Penyebab:** Path alias `@` tidak terkonfigurasi.  
**Solusi:** Pastikan keduanya sudah dikonfigurasi:
```typescript
// vite.config.ts → resolve.alias['@']
// tsconfig.app.json → compilerOptions.paths['@/*']
```

### `TS6133: X is declared but its value is never read`
**Penyebab:** `noUnusedLocals: true` aktif di tsconfig.  
**Solusi:** Hapus import yang tidak terpakai.

### `import type` error
**Penyebab:** `verbatimModuleSyntax: true` aktif.  
**Solusi:** Gunakan `import type { Foo }` untuk types-only imports.

### Service Worker tidak aktif di development
**Penyebab:** Vite dev server tidak memperlakukan `sw.js` sebagai SW.  
**Solusi:** Test PWA dengan `npm run build && npm run preview`.

### Dark mode tidak tersimpan setelah refresh
**Penyebab:** ThemeProvider tidak membaca `localStorage` saat init.  
**Solusi:** Periksa `src/providers/ThemeProvider.tsx` — inisialisasi harus cek `localStorage` sebelum set state.

### Build warning: chunk size > 500 kB
**Solusi:** Implementasikan `manualChunks` di `vite.config.ts` atau gunakan `React.lazy()` + `Suspense`.

---

*Dokumentasi ini dibuat untuk **EduCouns AI Frontend v1.0.0***  
*Terakhir diperbarui: Juli 2026*
