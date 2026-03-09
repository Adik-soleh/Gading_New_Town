# 🏙️ Gading New Town - Dashboard Manajemen Perumahan

Gading New Town Dashboard adalah sistem informasi manajemen perumahan berbasis web yang dirancang untuk memudahkan interaksi antara Pengurus RT (Admin) dengan Warga. Aplikasi ini mengelola berbagai kebutuhan administratif mulai dari data warga, data keluarga, iuran bulanan1 (IPL), pengajuan izin renovasi, pencatatan mutasi, hingga pelaporan atau pengaduan warga.

## 🚀 Fitur Utama

- **Role-Based Access Control (RBAC):** Memisahkan hak akses dan tampilan secara aman antara Ketua RT (Admin) dan Warga biasa.
- **Manajemen Data Warga & Keluarga:** Pencatatan komprehensif untuk struktur keluarga, dari Kepala Keluarga hingga anggota keluarganya.
- **Pembayaran IPL (Iuran Pemeliharaan Lingkungan):** Fasilitas pengecekan tagihan, unggah bukti bayar rutin, serta sistem tracking validasi oleh admin.
- **Pengajuan Izin Renovasi:** Memungkinkan warga mengajukan permohonan izin pembangunan/renovasi properti secara digital beserta dokumen pelengkapnya.
- **Mutasi Warga:** Sistem pendataan bagi penghuni baru (pindah masuk) atau penghuni lama yang pindah keluar.
- **Pelaporan Warga (Lapor):** Sarana pengaduan warga terkait masalah lingkungan, keamanan, atau fasilitas umum.

## 🛠️ Teknologi yang Digunakan

**Frontend:**
- [React.js](https://reactjs.org/) (v18)
- [Vite](https://vitejs.dev/) - Module bundler modern yang cepat
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Router DOM](https://reactrouter.com/) - Penanganan routing pada Client-Side
- [SweetAlert2](https://sweetalert2.github.io/) - Pop-up notifikasi yang interaktif

**Backend:**
- [NestJS](https://nestjs.com/) (v11) - Framework Node.js progresif
- [Prisma ORM](https://www.prisma.io/) - ORM mutakhir untuk Node.js & TypeScript
- [PostgreSQL](https://www.postgresql.org/) - Relational Database
- [Better-Auth](https://better-auth.com/) - Sistem Autentikasi komprehensif
- **Multer** - Handing file uploads (contoh: bukti bayar, dokumen izin)

---

## 📋 Prasyarat Sistem

Pastikan environment lokal Anda memenuhi prasyarat berikut sebelum memulai:
- [Node.js](https://nodejs.org/) (direkomendasikan versi 18.x atau yang lebih baru)
- Manajemen Database [PostgreSQL](https://www.postgresql.org/) yang siap digunakan
- [Git](https://git-scm.com/)

---

## ⚙️ Cara Instalasi & Menjalankan Aplikasi Lokal

Aplikasi ini menggunakan skema arsitektur _decoupled_, sehingga Anda perlu menjalankan `Frontend` dan `Backend` secara terpisah.

### 1. Persiapan Backend (NestJS API)

Buka terminal dan arahkan masuk ke folder `backend`:
```bash
cd backend
npm install
```

**Konfigurasi Environment Backend:**
Buat file bernama `.env` di dalam root folder `backend` Anda, lalu tambahkan URL koneksi ke PostgreSQL lokal Anda (sesuaikan user, password, dan nama database):
```env
DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/dashboard_new_town?schema=public"
```

**Jalankan Prisma Migrasi & Seeding:**
Sistem ini memuat database lokal Anda sesuai schema dan mengisi (seeding) otomatis akun Admin serta 10 akun dumy Warga untuk keperluan uji coba.
```bash
npx prisma migrate dev
npx prisma db seed
```

**Jalankan Server Backend (Mode Development):**
```bash
npm run start:dev
```
*Tip: Secara default, NestJS backend akan berjalan di `http://localhost:3000`.*

### 2. Persiapan Frontend (React Vite)

Buka jendela terminal baru dan pastikan Anda berada di root directory utama proyek (`Dashboard_new_town`):
```bash
npm install
```

**Konfigurasi Environment Frontend (Opsional):**
Buat file `.env` di root folder utama jika URL base API Anda berbeda dari default:
```env
VITE_API_URL="http://localhost:3000"
```

**Jalankan Server Jendela Frontend:**
```bash
npm run dev
```
*Tip: Frontend Vite akan langsung dapat diakses lewat browser, umumnya di URL `http://localhost:5173`.*

---

## 🔐 Kredensial Akun Default (Hasil Seeding)

Jika Anda telah menjalankan baris perintah seeding database pada tahap Setup Backend di atas, silakan log in menggunakan detail rincian profil berikut:

**Akses Admin (Ketua RT):**
- **Email:** `admin@gmail.com`
- **Password:** `admin123`

**Akses Warga Biasa:**
- **Email:** `warga1@gmail.com` (tersedia hingga `warga10@gmail.com`)
- **Password:** `123456`

---

## 📁 Struktur Dasar Direktori

Gambaran umum dari hirarki utama proyek ini:

```text
Dashboard_new_town/
├── backend/                  # --- BACKEND (NESTJS) ---
│   ├── prisma/               # Skema ORM database & File konfigurasi Seed
│   ├── src/
│   │   ├── modules/          # Modul fungsional (auth, warga, izin, laporan, dll)
│   │   └── main.ts           # Titik masuk utama server backend
│   └── package.json
│
├── src/                      # --- FRONTEND (REACT) ---
│   ├── components/           # Koleksi komponen UI (Modal, Button, Navbar, Sidebar)
│   ├── pages/                # Definisi level Halaman (Login, Dashboard, IPLPage, dsb)
│   ├── App.jsx               # Pengaturan Router
│   └── main.jsx
│
├── tailwind.config.js        # Pengaturan utilitas CSS Tailwind
├── vite.config.js            # Pengaturan build bundler web Vite
└── package.json              # Daftar library dependencies NPM untuk ranah FE
```
