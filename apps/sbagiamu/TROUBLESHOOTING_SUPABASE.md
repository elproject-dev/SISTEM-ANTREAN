# Panduan Troubleshooting Supabase Self-Hosted Sbagiamu

Dokumen ini berisi rangkuman masalah kritis yang pernah terjadi selama proses migrasi dan instalasi Supabase Self-Hosted di VPS, beserta solusi teknisnya. Gunakan panduan ini jika di masa depan Anda mengalami error yang sama.

---

## 1. Error WebSocket Realtime (Kode 503 atau 403)
**Gejala:** 
Console browser menampilkan error gagal terhubung ke WebSocket `ws://[IP_VPS]:8001/realtime/v1/websocket...` dengan status 503 (Service Unavailable) atau 403 (Forbidden). Log container `sbagiamu-realtime-1` menampilkan `TenantNotFound: Tenant not found: realtime`.

**Penyebab & Solusi:**

1. **Kong API Gateway Gagal Resolusi DNS (503):**
   * **Masalah:** Kong mencari hostname `realtime-dev.supabase-realtime` yang tidak ada di jaringan Docker.
   * **Solusi:** Buka file `volumes/api/kong.yml` dan pastikan konfigurasi host untuk rute realtime menunjuk langsung ke `realtime:4000` (nama service Docker lokal).

2. **Tenant Belum Didaftarkan (403):**
   * **Masalah:** Supabase Realtime wajib memiliki data "Tenant" dengan ID `realtime` di database internalnya.
   * **Solusi:** Jalankan query SQL berikut sebagai `supabase_admin`:
     ```sql
     INSERT INTO _realtime.tenants (id, name, external_id, jwt_secret, max_events_per_second, inserted_at, updated_at)
     VALUES (gen_random_uuid(), 'realtime', 'realtime', 'JWT_SECRET_DARI_ENV', 100, now(), now());
     ```
   * *Catatan:* Pastikan `external_id` bernilai `realtime` persis, bukan yang lain.

3. **JWT Secret Tidak Sinkron (403):**
   * **Masalah:** Token anon yang dipakai frontend dihasilkan dari rahasia JWT rahasia di `.env`, tetapi database Realtime menyimpan rahasia JWT yang berbeda.
   * **Solusi:** Samakan `jwt_secret` di tabel `_realtime.tenants` dengan `JWT_SECRET` yang ada di `.env` Docker Anda.

4. **Koneksi CDC Postgres Belum Diatur:**
   * **Masalah:** Realtime tidak bisa melacak perubahan database.
   * **Solusi:** Daftarkan ekstensi CDC:
     ```sql
     INSERT INTO _realtime.extensions (id, type, tenant_external_id, settings, inserted_at, updated_at)
     VALUES (gen_random_uuid(), 'postgres_cdc_rls', 'realtime', jsonb_build_object('db_host', 'db', 'db_port', '5432', 'db_name', 'postgres', 'db_user', 'supabase_admin', 'db_password', 'PASSWORD_DB_ANDA', 'region', 'us-east-1', 'poll_interval_ms', 100, 'poll_max_record_bytes', 1048576, 'ip_version', 4), now(), now());
     ```

**Tindakan Terakhir:** Selalu jalankan `docker restart sbagiamu-realtime-1` setelah melakukan perubahan di atas.

---

## 2. Error Gambar Storage Tidak Muncul (Kode 500)
**Gejala:**
Gambar produk tidak bisa diakses, HTTP mengembalikan status 500 Internal Server Error.

**Penyebab & Solusi:**

1. **File Fisik Tidak Ditemukan (Error ENOENT di Log Storage):**
   * **Masalah:** Anda memigrasi file secara manual dan menamainya menggunakan UUID dari kolom `id` tabel `storage.objects`. Kenyataannya, Supabase File Backend mencari nama file berdasarkan UUID dari kolom **`version`**.
   * **Solusi:** Rename semua nama file di folder `/volumes/storage/stub/stub/[BUCKET]/[NAMA_OBJEK]/` menjadi nilai `version`-nya.

2. **Metadata Sistem File Hilang (Error ENODATA di Log Storage):**
   * **Masalah:** Log Storage menunjukkan `The extended attribute does not exist. (errno 61)`. Supabase menyimpan *content-type* dan metadata lainnya bukan di dalam tabel, melainkan sebagai metadata sistem file (*Extended Attributes / xattr*) yang tersembunyi. Saat file diunduh manual pakai `curl`, metadata ini hilang.
   * **Solusi:** Injeksi manual *xattr* ke dalam file gambar. 
     * Di dalam OS host VPS, install toolnya: `sudo apt-get install attr`
     * Set metadata *content-type*:
       ```bash
       sudo find volumes/storage/stub -type f -exec setfattr -n user.supabase.content-type -v "image/webp" {} \;
       ```
     * Set metadata *cache-control*:
       ```bash
       sudo find volumes/storage/stub -type f -exec setfattr -n user.supabase.cache-control -v "max-age=3600" {} \;
       ```

3. **ImgProxy Transformation Error:**
   * **Masalah:** Pemanggilan `getProductImageUrl()` di frontend menggunakan fitur `transform: { width, height }`. Jika container `imgproxy` tidak dikonfigurasi sempurna, ia akan menyebabkan 500 error berantai.
   * **Solusi:** Modifikasi frontend untuk tidak menggunakan parameter `transform` pada `getPublicUrl` (mengambil gambar mentah/asli secara langsung) jika environment `imgproxy` sedang bermasalah.

**Tindakan Terakhir:** Selalu jalankan `docker restart sbagiamu-storage-1` jika metadata atau letak file diubah manual.
