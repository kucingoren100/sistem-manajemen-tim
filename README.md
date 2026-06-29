# Sistem Manajemen Anggaran Tim

Aplikasi web fullstack untuk manajemen anggaran organisasi/BEM/kepanitiaan.

## Stack
- **Frontend**: React.js + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express.js
- **Database**: MySQL

## Cara Menjalankan

### 1. Siapkan Database
- Buka phpMyAdmin atau MySQL client
- Import file: `backend/config/database.sql`

### 2. Setup Backend
```bash
cd backend
npm install
# Edit file .env sesuai konfigurasi MySQL kamu
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

## Akun Demo (password semua: `password`)
| Role    | Email                    |
|---------|--------------------------|
| Admin   | admin@organisasi.com     |
| Anggota | budi@organisasi.com      |
| Anggota | siti@organisasi.com      |
| Anggota | andi@organisasi.com      |

## Fitur
- Login multi-role (Admin & Anggota)
- Dashboard dengan grafik bar anggaran vs realisasi
- Progress bar status anggaran + over-budget alert
- CRUD Divisi dan Anggaran (admin)
- Form pengajuan pengeluaran (anggota)
- Approval/Reject dengan catatan admin
- Notifikasi in-app otomatis
- Riwayat pengajuan dengan status badge
