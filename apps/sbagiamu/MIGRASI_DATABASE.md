# Panduan Migrasi Database Supabase Cloud ke VPS (Self-Hosted)

Panduan ini berisi langkah-langkah anti-gagal untuk memigrasikan database dari Supabase Cloud ke server VPS lokal (Self-Hosted) berarsitektur Multi-Tenant menggunakan Docker.

## 1. Persiapan Koneksi (Sangat Penting!)
- **Hindari IPv6 Direct Connection:** Jangan gunakan alamat direct (port `5432` dengan host `db.[id].supabase.co`) karena VPS seringkali tidak mendukung IPv6 (`Network is unreachable`).
- **Gunakan Connection Pooling (IPv4):** Buka Dashboard Supabase Cloud -> *Project Settings* -> *Database* -> *Connection String* -> *URI* -> **Centang "Use connection pooling"**.
- **Aturan Password:** Jika password database Anda memiliki simbol (seperti `@`), sistem akan error saat membaca URL. Anda wajib melakukan *URL Encode* (`@` menjadi `%40`). **Saran terbaik:** Ganti password database Anda di dashboard menjadi murni huruf dan angka saja (misal: `elproject89890`).

*Contoh URL Pooler yang benar:*
`postgresql://postgres.wnozfcqgcmvxvkxbxgfj:elproject89890@aws-1-ap-south-1.pooler.supabase.com:6543/postgres`

---

## 2. Proses Download (Dump) dari Cloud
Gunakan alat bawaan `npx supabase` karena ia akan mendownload versi PostgreSQL (v17) yang sama persis dengan Supabase Cloud. Jika menggunakan `pg_dump` bawaan VPS (v15), Anda akan terkena error `server version mismatch`.

Jalankan ini di terminal VPS Anda:

```bash
# 1. Download Struktur Tabel (Schema)
npx supabase db dump --db-url "postgresql://postgres.wnozfcqgcmvxvkxbxgfj:elproject89890@aws-1-ap-south-1.pooler.supabase.com:6543/postgres" -f 1_schema.sql

# 2. Download Isi Data (Records)
npx supabase db dump --data-only --db-url "postgresql://postgres.wnozfcqgcmvxvkxbxgfj:elproject89890@aws-1-ap-south-1.pooler.supabase.com:6543/postgres" -f 2_data.sql
```

---

## 3. Menemukan Database Kamar (Multi-Tenant)
Karena Anda menggunakan sistem **Multi-Tenant**, data **TIDAK BOLEH** disuntik ke database bawaan bernama `postgres`. Data harus disuntik ke dalam nama database khusus aplikasi Anda (misal: `db_sbagiamu`).

Cek nama database Anda dengan perintah:
```bash
docker exec -i supabase_shared_db psql -U postgres -l
```
*(Catat nama database Anda, di panduan ini kita asumsikan namanya `db_sbagiamu`)*.

---

## 4. Proses Suntik (Restore) ke VPS Lokal
Lakukan 3 langkah ini secara **berurutan** untuk menyuntik data ke dalam kamar database aplikasi Anda.

**Langkah 4.1 - Suntik Struktur Tabel:**
```bash
docker exec -i supabase_shared_db psql -U postgres -d db_sbagiamu < 1_schema.sql
```

**Langkah 4.2 - Penyesuaian Kolom Auth (WAJIB!):**
Karena VPS sering memiliki versi GoTrue/Auth yang lebih tua dari Cloud, Anda wajib menyuntikkan kolom pelengkap berikut agar data login tidak error saat dimasukkan. Copy-paste sekaligus:
```bash
docker exec -i supabase_shared_db psql -U postgres -d db_sbagiamu -c '
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_confirmed_at timestamp with time zone;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_sso_user boolean DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change_token_new character varying(255);
ALTER TABLE auth.refresh_tokens ADD COLUMN IF NOT EXISTS parent varchar(255);
ALTER TABLE auth.refresh_tokens ADD COLUMN IF NOT EXISTS session_id uuid;
CREATE TABLE IF NOT EXISTS auth.identities (id text, user_id uuid, identity_data jsonb, provider text, provider_id text, last_sign_in_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, email text);
CREATE TABLE IF NOT EXISTS auth.sessions (id uuid, user_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, factor_id uuid, aal text, not_after timestamp with time zone, refreshed_at timestamp with time zone);
CREATE TABLE IF NOT EXISTS auth.mfa_amr_claims (session_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, authentication_method text, id uuid);
ALTER TABLE storage.buckets ADD COLUMN IF NOT EXISTS public boolean DEFAULT false;
ALTER TABLE storage.buckets ADD COLUMN IF NOT EXISTS avif_autodetection boolean DEFAULT false;
ALTER TABLE storage.objects ADD COLUMN IF NOT EXISTS version text;
ALTER TABLE storage.objects ADD COLUMN IF NOT EXISTS owner_id text;
'
```

**Langkah 4.3 - Suntik Seluruh Data:**
```bash
docker exec -i supabase_shared_db psql -U postgres -d db_sbagiamu < 2_data.sql
```

---

## 5. Kesalahan Umum (Troubleshooting)

- **Supabase Studio Kosong & Aplikasi Error 400 saat Login:**
  **Penyebab:** Anda salah menyuntikkan data ke `-d postgres`, padahal kamar database Anda adalah `-d db_sbagiamu`. 
  **Solusi:** Ulangi langkah 4 menggunakan nama database yang benar.
- **Aplikasi Android / Web Gagal Koneksi (`ERR_CONNECTION_REFUSED`):**
  **Penyebab:** File `.env` aplikasi Anda masih menggunakan `VITE_SUPABASE_URL=http://localhost:8000`. Jika dijalankan dari emulator atau perangkat lain, `localhost` tidak akan menemukan server VPS.
  **Solusi:** Ubah menjadi IP VPS yang asli, contoh: `VITE_SUPABASE_URL=http://192.168.1.6:8000`.
- **`zsh: no such file or directory: 2_data.sql` saat Restore:**
  **Penyebab:** Terminal Anda sedang berada di dalam folder yang salah (misal: `vps-supabase-multi`), sedangkan filenya ada di `/home/elproject/`.
  **Solusi:** Gunakan lokasi path absolut (contoh: `< /home/elproject/2_data.sql`).
