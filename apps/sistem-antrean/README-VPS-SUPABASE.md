# 🚀 Panduan Setup VPS & Instalasi Supabase (Versi Produksi)

Dokumen ini berisi panduan lengkap langkah demi langkah untuk menginstal Supabase dari nol pada server VPS (Virtual Private Server) atau VM (Virtual Machine) Anda.

Versi yang digunakan di sini adalah **Supabase Self-Hosted (Produksi)** berbasis Docker Compose, bukan versi Supabase CLI yang hanya ditujukan untuk lokal.

---

## 🏗️ Tahap 1: Persiapan Server
Pastikan VPS/VM Anda memenuhi spesifikasi berikut:
- **Sistem Operasi:** Ubuntu 22.04 / 24.04 LTS (atau Debian 12)
- **Spesifikasi Minimal:** RAM 2 GB, CPU 2 Core
- **Akses:** Anda harus bisa login ke terminal VPS menggunakan koneksi SSH.

---

## 🐳 Tahap 2: Instalasi Docker & Git
Jalankan deretan perintah berikut di terminal VPS Anda untuk menginstal semua kebutuhan dasar (Docker, Docker Compose, dan Git).

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install dependensi dasar
sudo apt-get install ca-certificates curl gnupg git -y

# Tambahkan Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --deararm -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Tambahkan Docker repository (Sesuaikan dengan OS Anda, contoh ini untuk Debian/Ubuntu)
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine & Docker Compose
sudo apt update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Tambahkan user saat ini ke grup docker (agar tidak perlu sudo)
sudo usermod -aG docker $USER
```
*(Tips: Disarankan untuk `logout` dan login `ssh` kembali agar izin grup docker aktif).*

---

## 📥 Tahap 3: Download (Clone) Supabase Resmi
Jangan menggunakan `npx supabase init` di VPS. Anda wajib mendownload langsung dari repositori resmi Supabase:

```bash
# Masuk ke folder home
cd ~

# Clone repositori supabase
git clone --depth 1 https://github.com/supabase/supabase supabase-prod

# Masuk ke folder docker
cd supabase-prod/docker

# Gandakan file pengaturan default (.env)
cp .env.example .env
```

---

## 🔐 Tahap 4: Konfigurasi Keamanan (File .env)
Sebelum menyalakan server, Anda **WAJIB** mengubah kunci rahasia di dalam file `.env`.

Buka file `.env` menggunakan teks editor:
```bash
nano .env
```

Ubah baris-baris berikut dengan nilai acak buatan Anda sendiri:
1. `POSTGRES_PASSWORD=BikinPasswordPostgresYangSangatKuatDanPanjang123!`
2. `JWT_SECRET=GabunganHurufDanAngkaAcakMinimal32KarakterRahasia!!`
3. `DASHBOARD_USERNAME=admin` *(Ganti dengan username login panel Anda)*
4. `DASHBOARD_PASSWORD=SandiRahasiaDashboard123` *(Ganti dengan password panel Anda)*
5. **Matikan Verifikasi Email (Wajib):** Cari `ENABLE_EMAIL_AUTOCONFIRM=false` dan ubah menjadi `ENABLE_EMAIL_AUTOCONFIRM=true`
6. **Buka Akses Skema Anda (Wajib):** Cari `PGRST_DB_SCHEMAS=public,graphql_public` dan tambahkan `,sistem-antrean` di ujungnya sehingga menjadi `PGRST_DB_SCHEMAS=public,graphql_public,sistem-antrean`

*(Cara menyimpan di nano: Tekan `Ctrl+X`, lalu `Y`, lalu `Enter`)*.

---

## 🚀 Tahap 5: Menjalankan Server Supabase
Masih di dalam folder `docker`, jalankan perintah berikut untuk mengunduh semua mesin Supabase dan menyalakannya:

```bash
docker compose pull
docker compose up -d
```
Tunggu hingga proses selesai. Untuk mengecek apakah semua layanan berjalan normal, gunakan perintah:
```bash
docker compose ps
```

---

## 🗄️ Tahap 6: Memigrasikan Database (Struktur Tabel)
Supabase versi baru dilengkapi dengan pelindung *Supavisor Connection Pooler*, sehingga push migrasi langsung dari luar kadang terblokir. Cara paling aman dan mudah untuk memigrasikan tabel adalah melalui Dasbor Web.

1. Buka browser di komputer Anda, lalu akses: `http://<IP_VPS_ANDA>:8000`
2. Login menggunakan `DASHBOARD_USERNAME` dan `DASHBOARD_PASSWORD` yang Anda atur di Tahap 4.
3. Di menu sebelah kiri, klik **SQL Editor** (lambang `{}`).
4. Klik **New query**.
5. Buka file skema SQL proyek Anda di laptop (misal: `20260727000001_sistem_antrean_schema.sql`).
6. **Copy** seluruh isi file tersebut, dan **Paste** ke kotak SQL Editor di browser.
7. Klik **Run** (Jalankan).

Jika muncul status "Success", maka database Anda sudah siap digunakan!

---

## 🌐 Tahap 7: Mendapatkan Kunci Akses untuk Frontend
Untuk menghubungkan aplikasi React/Vite (Frontend) Anda ke VPS, Anda membutuhkan API URL dan ANON KEY.

1. Kembali ke Supabase Studio (Browser).
2. Klik ikon ⚙️ **Settings** di pojok kiri bawah.
3. Pilih menu **API**.
4. Salin kunci **`anon` `public`**.
5. Masukkan kunci tersebut ke dalam file `.env` di proyek Frontend Anda beserta IP VPS-nya:

```env
VITE_SUPABASE_URL=http://<IP_VPS_ANDA>:8000
VITE_SUPABASE_ANON_KEY=eyJhbG... (hasil salinan tadi)
```

> **⚠️ PENTING TENTANG HTTPS & HOSTING ONLINE:**
> Jika Anda mengunggah frontend Anda ke layanan hosting publik (seperti GitHub Pages atau Vercel), aplikasi web Anda akan berjalan dengan koneksi aman (HTTPS). Browser secara otomatis akan memblokir (*Mixed Content*) web HTTPS yang mencoba mengambil data dari API yang belum menggunakan HTTPS (`http://IP_VPS_ANDA:8000`).
>
> **Solusinya:** Anda harus memiliki **Nama Domain** dan memasang **Nginx + Let's Encrypt (SSL)** di VPS Anda sebagai *Reverse Proxy*, sehingga URL API Anda berubah menjadi aman (contoh: `https://api.domainanda.com`).
