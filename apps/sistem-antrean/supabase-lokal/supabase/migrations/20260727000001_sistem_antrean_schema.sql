-- ============================================================
-- SISTEM ANTREAN — Schema Migration
-- Schema: sistem-antrean
-- ============================================================

-- Pastikan schema sudah ada
CREATE SCHEMA IF NOT EXISTS "sistem-antrean";

-- ─── Helper: updated_at trigger function ─────────────────────
CREATE OR REPLACE FUNCTION "sistem-antrean".set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── TABEL: services ─────────────────────────────────────────
-- Layanan yang tersedia (A=Umum, B=Keuangan, dsb)
CREATE TABLE IF NOT EXISTS "sistem-antrean".services (
  code        TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON "sistem-antrean".services
  FOR EACH ROW EXECUTE FUNCTION "sistem-antrean".set_updated_at();

-- ─── TABEL: counters ─────────────────────────────────────────
-- Nomor urut per layanan, di-reset setiap hari
CREATE TABLE IF NOT EXISTS "sistem-antrean".counters (
  service_code TEXT        NOT NULL REFERENCES "sistem-antrean".services(code) ON DELETE CASCADE,
  date         DATE        NOT NULL DEFAULT CURRENT_DATE,
  value        INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (service_code, date)
);

CREATE TRIGGER counters_updated_at
  BEFORE UPDATE ON "sistem-antrean".counters
  FOR EACH ROW EXECUTE FUNCTION "sistem-antrean".set_updated_at();

-- ─── TABEL: staff_users ──────────────────────────────────────
-- Profile tambahan dari auth.users
CREATE TABLE IF NOT EXISTS "sistem-antrean".staff_users (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id    UUID        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  phone      TEXT        NOT NULL DEFAULT '',
  role       TEXT        NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator')),
  status     TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER staff_users_updated_at
  BEFORE UPDATE ON "sistem-antrean".staff_users
  FOR EACH ROW EXECUTE FUNCTION "sistem-antrean".set_updated_at();

-- ─── TABEL: operator_sessions ────────────────────────────────
-- Sesi operator yang sedang aktif / login
CREATE TABLE IF NOT EXISTS "sistem-antrean".operator_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id          UUID        REFERENCES "sistem-antrean".staff_users(id) ON DELETE SET NULL,
  name              TEXT        NOT NULL,
  loket             INTEGER     NOT NULL CHECK (loket BETWEEN 1 AND 10),
  status            TEXT        NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  service_codes     TEXT[]      NOT NULL DEFAULT '{}',
  current_ticket_id UUID,  -- foreign key ditambahkan setelah tabel tickets
  total_served      INTEGER     NOT NULL DEFAULT 0,
  total_skipped     INTEGER     NOT NULL DEFAULT 0,
  login_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (loket)  -- satu loket hanya satu operator aktif
);

CREATE TRIGGER operator_sessions_updated_at
  BEFORE UPDATE ON "sistem-antrean".operator_sessions
  FOR EACH ROW EXECUTE FUNCTION "sistem-antrean".set_updated_at();

-- ─── TABEL: tickets ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "sistem-antrean".tickets (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  number          INTEGER     NOT NULL,
  display_number  TEXT        NOT NULL,
  service_code    TEXT        NOT NULL REFERENCES "sistem-antrean".services(code) ON DELETE RESTRICT,
  type            TEXT        NOT NULL DEFAULT 'offline' CHECK (type IN ('offline', 'online', 'priority')),
  status          TEXT        NOT NULL DEFAULT 'waiting'
                              CHECK (status IN ('pending_checkin', 'waiting', 'calling', 'serving', 'done', 'skipped')),
  -- Data pelanggan (opsional, untuk online)
  customer_name   TEXT,
  customer_phone  TEXT,
  purpose         TEXT,
  booking_code    TEXT        UNIQUE,
  -- Penugasan ke operator/loket
  assigned_loket  INTEGER,
  operator_id     UUID        REFERENCES "sistem-antrean".operator_sessions(id) ON DELETE SET NULL,
  operator_name   TEXT,
  -- Timestamps aktivitas
  taken_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_at   TIMESTAMPTZ,
  assigned_at     TIMESTAMPTZ,
  called_at       TIMESTAMPTZ,
  done_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON "sistem-antrean".tickets
  FOR EACH ROW EXECUTE FUNCTION "sistem-antrean".set_updated_at();

-- Tambahkan FK current_ticket_id setelah tabel tickets dibuat
ALTER TABLE "sistem-antrean".operator_sessions
  ADD CONSTRAINT fk_current_ticket
  FOREIGN KEY (current_ticket_id) REFERENCES "sistem-antrean".tickets(id) ON DELETE SET NULL;

-- ─── TABEL: running_texts ────────────────────────────────────
CREATE TABLE IF NOT EXISTS "sistem-antrean".running_texts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  text       TEXT        NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER running_texts_updated_at
  BEFORE UPDATE ON "sistem-antrean".running_texts
  FOR EACH ROW EXECUTE FUNCTION "sistem-antrean".set_updated_at();

-- ─── INDEX untuk performa ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tickets_status ON "sistem-antrean".tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_service_code ON "sistem-antrean".tickets(service_code);
CREATE INDEX IF NOT EXISTS idx_tickets_taken_at ON "sistem-antrean".tickets(taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_booking_code ON "sistem-antrean".tickets(booking_code) WHERE booking_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_operator_sessions_loket ON "sistem-antrean".operator_sessions(loket);
CREATE INDEX IF NOT EXISTS idx_operator_sessions_status ON "sistem-antrean".operator_sessions(status);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE "sistem-antrean".services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sistem-antrean".counters         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sistem-antrean".staff_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sistem-antrean".operator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sistem-antrean".tickets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sistem-antrean".running_texts    ENABLE ROW LEVEL SECURITY;

-- Policy: anon & authenticated bisa baca semua tabel (untuk TV, public page, dsb)
CREATE POLICY "allow_read_services" ON "sistem-antrean".services
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "allow_read_counters" ON "sistem-antrean".counters
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "allow_read_tickets" ON "sistem-antrean".tickets
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "allow_read_operator_sessions" ON "sistem-antrean".operator_sessions
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "allow_read_running_texts" ON "sistem-antrean".running_texts
  FOR SELECT TO anon, authenticated USING (TRUE);

-- Policy: authenticated bisa INSERT/UPDATE/DELETE semuanya
CREATE POLICY "allow_write_services" ON "sistem-antrean".services
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "allow_write_counters" ON "sistem-antrean".counters
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "allow_write_tickets" ON "sistem-antrean".tickets
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "allow_write_operator_sessions" ON "sistem-antrean".operator_sessions
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "allow_write_running_texts" ON "sistem-antrean".running_texts
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Policy staff_users: user hanya bisa lihat/edit profilnya sendiri, admin bisa semua
CREATE POLICY "allow_read_own_staff" ON "sistem-antrean".staff_users
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid() OR EXISTS (
    SELECT 1 FROM "sistem-antrean".staff_users su
    WHERE su.auth_id = auth.uid() AND su.role = 'admin' AND su.status = 'active'
  ));

CREATE POLICY "allow_insert_staff" ON "sistem-antrean".staff_users
  FOR INSERT TO authenticated WITH CHECK (auth_id = auth.uid());

CREATE POLICY "allow_update_own_staff" ON "sistem-antrean".staff_users
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid() OR EXISTS (
    SELECT 1 FROM "sistem-antrean".staff_users su
    WHERE su.auth_id = auth.uid() AND su.role = 'admin' AND su.status = 'active'
  ));

CREATE POLICY "allow_delete_staff" ON "sistem-antrean".staff_users
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "sistem-antrean".staff_users su
    WHERE su.auth_id = auth.uid() AND su.role = 'admin' AND su.status = 'active'
  ));

-- ─── REALTIME ────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE "sistem-antrean".tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE "sistem-antrean".operator_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE "sistem-antrean".running_texts;
ALTER PUBLICATION supabase_realtime ADD TABLE "sistem-antrean".services;

-- ─── GRANTS ──────────────────────────────────────────────────
GRANT USAGE ON SCHEMA "sistem-antrean" TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA "sistem-antrean" TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA "sistem-antrean" TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "sistem-antrean" TO authenticated, service_role;

-- ─── SEED: Layanan Default ───────────────────────────────────
INSERT INTO "sistem-antrean".services (code, name, description, sort_order) VALUES
  ('A', 'Pelayanan Umum',  'Informasi, surat keterangan, layanan umum',       1),
  ('B', 'Keuangan',        'Pembayaran, tagihan, dan layanan keuangan',        2),
  ('C', 'Administrasi',   'Pendaftaran, perizinan, dan dokumen resmi',        3),
  ('D', 'Teknis',          'Konsultasi teknis dan bantuan operasional',        4)
ON CONFLICT (code) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order  = EXCLUDED.sort_order;

-- ─── SEED: Running Text Default ──────────────────────────────
INSERT INTO "sistem-antrean".running_texts (text, is_active, sort_order) VALUES
  ('Harap memperhatikan layar panggilan dan tetap berada di area tunggu.',          TRUE, 1),
  ('Silakan ambil nomor antrean di meja resepsionis atau melalui aplikasi online.', TRUE, 2),
  ('Terima kasih atas kesabaran Anda.',                                             TRUE, 3)
ON CONFLICT DO NOTHING;
