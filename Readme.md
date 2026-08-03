# 📦 Assetify - Sistem Manajemen Aset & Layanan IT

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38BDF8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Private-red)

---

## 📖 Deskripsi

**Assetify** merupakan sistem manajemen inventaris aset IT dan portal layanan perbaikan berbasis web (*Full-stack JavaScript*) yang dikembangkan untuk membantu instansi dalam mengelola aset teknologi informasi secara terpusat.

Aplikasi ini menyediakan fitur inventarisasi aset, pengelolaan master data, manajemen pengguna, pelaporan kerusakan perangkat, hingga monitoring proses perbaikan secara **real-time**.

---

# ✨ Fitur Utama

## 👑 Modul Admin

### 📊 Dashboard Analitik

- Ringkasan total aset
- Statistik kondisi aset
- Statistik pengajuan perbaikan
- Monitoring data secara real-time

### 💻 Manajemen Aset

- Tambah data aset
- Edit data aset
- Hapus data aset
- Detail informasi aset
- Status aset
- Penanggung jawab aset

### 📁 Manajemen Master Data

Mengelola data:

- Kategori Aset
- Lokasi Aset

### 👥 Manajemen Pengguna

- Tambah akun pegawai
- Edit akun
- Hapus akun
- Manajemen Role

### 🔧 Manajemen Perbaikan

Mengelola seluruh tiket pengajuan kerusakan.

Status yang tersedia:

- Pending
- Diproses
- Selesai

### 📤 Ekspor Data

- Export data aset
- Rekapitulasi data

---

## 👤 Modul Pegawai

### 📊 Dashboard Pegawai

- Melihat aset yang dimiliki
- Statistik pengajuan perbaikan

### 📝 Pengajuan Perbaikan

Pegawai dapat mengirim laporan kerusakan aset yang berisi:

- Tingkat urgensi
- Deskripsi kerusakan
- Aset yang dilaporkan

### 📍 Lacak Status

Monitoring perkembangan perbaikan aset.

Status:

- Pending
- Diproses
- Selesai

---

# 🛠️ Tech Stack

## Frontend

| Teknologi | Keterangan |
|------------|------------|
| React.js (Vite) | Frontend Framework |
| Tailwind CSS | Styling |
| PostCSS | CSS Processing |
| React Router DOM | Routing |
| Axios | HTTP Client |
| Lucide React | Icons |

---

## Backend

| Teknologi | Keterangan |
|------------|------------|
| Node.js | Runtime Environment |
| Express.js | Backend Framework |
| Supabase | PostgreSQL Database & Storage |
| JWT | Authentication |
| Custom Validator | Data Validation |

---

# 📂 Struktur Project

```text
Assetify-main/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── validators/
│   │   └── server.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

# 🚀 Instalasi

## 1️⃣ Clone Repository

```bash
git clone https://github.com/username/Assetify.git

cd Assetify
```

---

# Backend

Masuk ke folder backend

```bash
cd backend
```

Install dependency

```bash
npm install
```

Buat file `.env`

```env
PORT=5000

SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_URL.supabase.co

SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY

JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY
```

Jalankan backend

Mode Development

```bash
npm run dev
```

Mode Production

```bash
npm start
```

Backend berjalan pada

```
http://localhost:5000
```

---

# Frontend

Masuk ke folder frontend

```bash
cd frontend
```

Install dependency

```bash
npm install
```

Buat file `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Jalankan frontend

```bash
npm run dev
```

Frontend berjalan pada

```
http://localhost:5173
```

---

# 🔒 Role & Hak Akses

| Fitur | Admin | Pegawai |
|--------|:----:|:--------:|
| Dashboard Statistik | ✅ | ✅ |
| Kelola Data Aset | ✅ | ❌ |
| Kelola Master Data | ✅ | ❌ |
| Kelola Data Pengguna | ✅ | ❌ |
| Pengajuan Perbaikan | ❌ | ✅ |
| Update Status Perbaikan | ✅ | ❌ |
| Export Data | ✅ | ❌ |

---

---

# 📌 Fitur yang Digunakan

- Responsive Design
- JWT Authentication
- CRUD Management
- Dashboard Analytics
- Asset Tracking
- Repair Management
- Role Based Access Control
- Export Data
- REST API
- PostgreSQL Database
- Cloud Storage
- Modern UI dengan Tailwind CSS

---

# 👨‍💻 Tim Pengembang

**Assetify Team**

Sistem ini dikembangkan sebagai proyek Sistem Informasi Manajemen Aset IT untuk mendukung digitalisasi pengelolaan aset dan layanan perbaikan perangkat pada instansi/SAMSAT.

---

# 📜 Lisensi

Hak Cipta © 2026 **Assetify Team**

Proyek ini dikembangkan untuk kebutuhan Sistem Informasi Manajemen Aset IT Instansi/SAMSAT.