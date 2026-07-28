#!/bin/bash

# ==============================================================================
# SCRIPT UNTUK PUSH MIGRASI KE VPS / VM
# ==============================================================================
# Script ini digunakan untuk mengirim struktur tabel dan fungsi (skema)
# dari komputer lokal Anda langsung ke database Supabase di VPS Anda.

echo "🚀 Memulai proses migrasi ke VPS..."

# Minta pengguna memasukkan IP VPS dan Password Database
read -p "Masukkan IP Publik VPS Anda (misal: 103.45.xx.xx): " VPS_IP
read -s -p "Masukkan Password Postgres VPS Anda (POSTGRES_PASSWORD dari .env VM): " DB_PASSWORD
echo ""

if [ -z "$VPS_IP" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: IP VPS dan Password tidak boleh kosong!"
    exit 1
fi

# URL Koneksi Postgres standar untuk Supabase Self-Hosted (port 5432)
# Gunakan 'postgres' sebagai user dan db name default di Supabase Self-Hosted
DB_URL="postgresql://postgres:${DB_PASSWORD}@${VPS_IP}:5432/postgres"

echo "⏳ Sedang menghubungkan dan mengirim migrasi ke $VPS_IP..."

# Jalankan perintah Supabase CLI db push dengan URL Database langsung
npx supabase db push --db-url "$DB_URL"

if [ $? -eq 0 ]; then
    echo "✅ BERHASIL! Skema database telah di-push ke VPS Anda."
else
    echo "❌ GAGAL! Terjadi kesalahan saat melakukan push."
    echo "Pastikan:"
    echo "1. VPS Anda sudah menyala dan Supabase Docker sudah 'Up'."
    echo "2. Port 5432 (PostgreSQL) pada Firewall VPS Anda dalam keadaan TERBUKA (Open) untuk sementara."
    echo "3. Password yang Anda masukkan benar."
fi
