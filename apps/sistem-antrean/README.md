# 🖥️ Sistem Antrean Digital (Digital Queue System)

Sebuah aplikasi sistem antrean digital modern berbasis web yang dibangun menggunakan **React**, **TypeScript**, **Vite**, dan **Supabase**. Sistem ini dirancang untuk memudahkan manajemen antrean dengan tampilan yang responsif, interaktif, dan *real-time*.

---

## ✨ Fitur Utama

- **Tampilan Publik (Public View):** Halaman bagi pelanggan untuk mengambil tiket antrean secara mandiri (Kiosk).
- **Layar TV (TV Display):** Tampilan layar besar yang menampilkan antrean berjalan secara *real-time*, lengkap dengan *running text* dan suara pemanggilan.
- **Panel Operator:** Dasbor khusus untuk staf di loket dalam melayani, memanggil ulang (recall), atau melewati (skip) nomor antrean.
- **Manajemen Admin:** Panel kontrol untuk mengatur data layanan, loket, teks berjalan, riwayat antrean, dan persetujuan staf baru.
- **Sistem Autentikasi Multi-Role:** Membedakan hak akses antara **Admin** dan **Operator**.
- **Real-time Sinkronisasi:** Memanfaatkan fitur *real-time subscriptions* dari Supabase sehingga setiap pembaruan langsung tampil di semua layar tanpa perlu *refresh*.

---

## 🔄 Alur Kerja Sistem (System Workflow)

1. **Pengambilan Tiket:** Pelanggan mendatangi mesin Kiosk (Halaman Publik) dan memilih layanan yang diinginkan untuk mencetak/mendapatkan nomor tiket.
2. **Menunggu:** Nomor antrean pelanggan masuk ke dalam daftar tunggu (Waiting List).
3. **Pemanggilan (Calling):** Operator di loket menekan tombol panggil. Layar TV akan berbunyi dan menampilkan nomor antrean yang dipanggil beserta nomor loket.
4. **Pelayanan (Serving):** Status antrean berubah menjadi sedang dilayani. 
5. **Selesai/Dilewati (Done/Skipped):** Setelah selesai, operator menyelesaikan tiket tersebut, atau melewatinya jika pelanggan tidak hadir.

---

## 👥 Konsep Role & Hak Akses

Aplikasi ini memiliki pengelolaan akses staf dengan 2 *role* utama:

### 1. Super Admin (Root)
- Email khusus: `elproject.dev@gmail.com`
- Memiliki hak akses penuh (bypass) tanpa perlu didaftarkan atau menunggu persetujuan (status *pending*) di database.
- Bertugas untuk mengelola (menyetujui/menolak) akun staf yang baru mendaftar.

### 2. Admin
- Memiliki akses ke **Dashboard**, **Riwayat Antrean**, **Pengaturan Sistem** (Teks Berjalan, Layanan), dan manajemen **Staff**.
- Dapat melihat statistik performa antrean dan operator.

### 3. Operator
- Akses terbatas hanya pada **Panel Operator**.
- Bertugas untuk masuk ke loket tertentu, memanggil antrean, dan memproses tiket.

*(Catatan: Semua pengguna yang mendaftar secara default akan masuk sebagai 'Operator' dengan status 'pending' sampai disetujui oleh Admin).*

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Backend & Database:** Supabase (PostgreSQL, Auth, Realtime)
- **State Management & Hooks:** React Hooks Context

---

## 🚀 Panduan Instalasi (Setup Guide)

### 1. Kebutuhan Sistem
Pastikan Anda telah menginstal **Node.js** dan **pnpm**.

### 2. Kloning Repositori & Instalasi Dependensi
```bash
git clone <URL_REPOSITORI>
cd sistem-antrean
pnpm install
```

### 3. Konfigurasi Environment (Variabel Lingkungan)
Buat file `.env` di *root directory* proyek dan tambahkan kunci Supabase Anda:
```env
VITE_SUPABASE_URL=https://proyek-anda.supabase.co
VITE_SUPABASE_ANON_KEY=kunci-anon-supabase-anda
```

### 4. Menjalankan Aplikasi di Mode Pengembangan
```bash
pnpm dev
```
Aplikasi akan berjalan di `http://localhost:5174/` (atau port lain sesuai terminal).

---

## 📂 Struktur Halaman Utama (Routes)

- `/public` : Layar Kiosk untuk pelanggan mengambil tiket.
- `/tv` : Layar besar untuk ruang tunggu.
- `/login` : Halaman masuk staf (Admin / Operator).
- `/register` : Halaman pendaftaran staf baru.
- `/dashboard` : Beranda statistik antrean (Admin).
- `/operator` : Layar kerja pemanggilan antrean (Operator).

---

*Didokumentasikan dengan ❤️ untuk memastikan pengembangan yang lebih terstruktur dan berkesinambungan.*
