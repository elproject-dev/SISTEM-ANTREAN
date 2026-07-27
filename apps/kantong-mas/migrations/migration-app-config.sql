-- ============================================
-- App Config Table for Update Checking
-- ============================================

-- Buat tabel app_config untuk menyimpan konfigurasi remote
CREATE TABLE IF NOT EXISTS app_config (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert konfigurasi default untuk update checker
INSERT INTO app_config (key, value) VALUES 
  ('app_version_latest', '1.0.0'),
  ('force_update', 'false'),
  ('download_url', 'https://play.google.com/store/apps/details?id=com.kasir.app'),
  ('update_title', 'Update Tersedia!'),
  ('update_message', 'Versi terbaru sudah tersedia saat ini.'),
  ('update_changelog', '["Perbaikan bug","Peningkatan performa","Fitur Update"]')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Policy: Semua user (termasuk anon) bisa baca config
CREATE POLICY "Allow read for all" ON app_config 
  FOR SELECT USING (true);

-- GRANT permission untuk role anon dan authenticated
GRANT SELECT ON app_config TO anon, authenticated;
