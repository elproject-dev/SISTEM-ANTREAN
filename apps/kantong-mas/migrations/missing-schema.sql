-- MISSING MIGRATIONS 

-- FILE: create_visit_schedules.sql 
-- ================================================================
-- Migration: Jadwal Kunjungan Sales
-- Jalankan script ini di Supabase Dashboard > SQL Editor
-- ================================================================

-- Tabel utama jadwal kunjungan
CREATE TABLE IF NOT EXISTS visit_schedules (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  customer_name TEXT,
  sales_name TEXT NOT NULL,
  staff_id INTEGER,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  -- 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu, 7=Minggu
  visit_time TEXT,             -- Format HH:MM (optional)
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id TEXT                -- Multi-tenant filter
);

-- Tabel log kunjungan (GPS check-in)
CREATE TABLE IF NOT EXISTS visit_logs (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES visit_schedules(id) ON DELETE SET NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  sales_name TEXT NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_address TEXT,
  notes TEXT,
  owner_id TEXT
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_visit_schedules_day ON visit_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_visit_schedules_owner ON visit_schedules(owner_id);
CREATE INDEX IF NOT EXISTS idx_visit_schedules_customer ON visit_schedules(customer_id);
CREATE INDEX IF NOT EXISTS idx_visit_logs_schedule ON visit_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_visit_logs_owner ON visit_logs(owner_id);
CREATE INDEX IF NOT EXISTS idx_visit_logs_visited_at ON visit_logs(visited_at);

-- RLS Policies (Row Level Security) - sesuai pola yang sudah ada di proyek
ALTER TABLE visit_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write dengan anon key (sesuai arsitektur proyek)
CREATE POLICY "Public access visit_schedules" ON visit_schedules
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public access visit_logs" ON visit_logs
  FOR ALL USING (true) WITH CHECK (true);


-- FILE: migration-add-bank-and-bluetooth-fields.sql 
-- Migration to add bank account info and bluetooth print store name to outlets table
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS bank_account VARCHAR(255);
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS bluetooth_store_name VARCHAR(255);


-- FILE: migration-add-customer-sales-name.sql 
-- Add sales_name to customers table to track who input the data
ALTER TABLE customers ADD COLUMN IF NOT EXISTS sales_name VARCHAR(255);


-- FILE: migration-add-discount-note.sql 
-- Migration: Add discount_note & customer_type to transactions table
-- Jalankan di Supabase Dashboard â†’ SQL Editor

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'transactions' AND column_name = 'discount_note'
    ) THEN
        ALTER TABLE transactions
        ADD COLUMN discount_note VARCHAR(255);

        COMMENT ON COLUMN transactions.discount_note IS 'Keterangan atau alasan diskon pada transaksi';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'transactions' AND column_name = 'customer_type'
    ) THEN
        ALTER TABLE transactions
        ADD COLUMN customer_type VARCHAR(50) DEFAULT 'non_member';

        COMMENT ON COLUMN transactions.customer_type IS 'Tipe pelanggan saat transaksi: member atau non_member';
    END IF;
END $$;

-- Isi status pelanggan dari data customers yang sudah ada
UPDATE transactions t
SET customer_type = COALESCE(c.membership_type, 'non_member')
FROM customers c
WHERE t.customer_id = c.id
  AND (t.customer_type IS NULL OR t.customer_type = 'non_member');


-- FILE: migration-add-product-hpp.sql 
-- Migration: Add HPP (Harga Pokok Penjualan) column to products table
-- Run this in Supabase SQL Editor

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS hpp numeric(15, 2) DEFAULT NULL;

COMMENT ON COLUMN products.hpp IS 'Harga Pokok Penjualan (modal/biaya per unit pcs)';


-- FILE: migration-add-staff-password.sql 
-- DEPRECATED: Login tidak lagi memakai tabel staff.
-- Gunakan migration-setup-admin-auth.sql (Supabase Auth saja).


-- FILE: migration-add-total-spent.sql 
-- Migration: Add total_spent field to customers table
-- Run this in Supabase SQL Editor

-- Check if column already exists before adding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='customers' AND column_name='total_spent'
    ) THEN
        ALTER TABLE customers
        ADD COLUMN total_spent DECIMAL(12, 2) DEFAULT 0;

        COMMENT ON COLUMN customers.total_spent IS 'Total amount spent by customer across all transactions';
    END IF;
END $$;


-- FILE: migration-app-config.sql 
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


-- FILE: migration-customer-returns.sql 
-- Migration: Customer Returns
-- Adds sales_returns and sales_return_items to track customer product returns

-- Create sales_returns table
CREATE TABLE IF NOT EXISTS sales_returns (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  cashier_name VARCHAR(255),
  total_refund DECIMAL(12, 2) NOT NULL DEFAULT 0,
  reason VARCHAR(255) NOT NULL, -- e.g., 'Barang Rusak', 'Kadaluarsa', 'Salah Produk', 'Lainnya'
  notes TEXT,
  status VARCHAR(50) DEFAULT 'completed', -- 'completed', 'pending'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales_return_items table
CREATE TABLE IF NOT EXISTS sales_return_items (
  id BIGSERIAL PRIMARY KEY,
  return_id BIGINT NOT NULL REFERENCES sales_returns(id) ON DELETE CASCADE,
  transaction_item_id BIGINT NOT NULL REFERENCES transaction_items(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  unit_name VARCHAR(50),
  quantity INTEGER NOT NULL,
  refund_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_return_items ENABLE ROW LEVEL SECURITY;

-- Policies for sales_returns
DROP POLICY IF EXISTS "Allow public read on sales_returns" ON sales_returns;
CREATE POLICY "Allow public read on sales_returns" ON sales_returns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on sales_returns" ON sales_returns;
CREATE POLICY "Allow public insert on sales_returns" ON sales_returns FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on sales_returns" ON sales_returns;
CREATE POLICY "Allow public update on sales_returns" ON sales_returns FOR UPDATE USING (true);

-- Policies for sales_return_items
DROP POLICY IF EXISTS "Allow public read on sales_return_items" ON sales_return_items;
CREATE POLICY "Allow public read on sales_return_items" ON sales_return_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on sales_return_items" ON sales_return_items;
CREATE POLICY "Allow public insert on sales_return_items" ON sales_return_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on sales_return_items" ON sales_return_items;
CREATE POLICY "Allow public update on sales_return_items" ON sales_return_items FOR UPDATE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_sales_returns_updated_at BEFORE UPDATE ON sales_returns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- FILE: migration-delete-stock-movements.sql 
-- Enable delete operations on stock_movements for authenticated users
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.stock_movements;
CREATE POLICY "Enable delete for authenticated users" ON public.stock_movements
    FOR DELETE USING (auth.uid() IS NOT NULL);


-- FILE: migration-enable-realtime-publications.sql 
-- Enable realtime for products, categories, and product_uoms tables in Supabase Realtime publication
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- Check if products is already in the publication before adding
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'products'
    ) then
      alter publication supabase_realtime add table products;
    end if;

    -- Check if categories is already in the publication before adding
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'categories'
    ) then
      alter publication supabase_realtime add table categories;
    end if;

    -- Check if product_uoms is already in the publication before adding
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'product_uoms'
    ) then
      alter publication supabase_realtime add table product_uoms;
    end if;
  end if;
exception
  when others then
    raise notice 'Could not automatically add tables to supabase_realtime publication: %', sqlerrm;
end;
$$;


-- FILE: migration-enable-return-delete.sql 
-- Enable DELETE policy for sales_returns
DROP POLICY IF EXISTS "Allow public delete on sales_returns" ON sales_returns;
CREATE POLICY "Allow public delete on sales_returns" ON sales_returns FOR DELETE USING (true);

-- Enable DELETE policy for sales_return_items
DROP POLICY IF EXISTS "Allow public delete on sales_return_items" ON sales_return_items;
CREATE POLICY "Allow public delete on sales_return_items" ON sales_return_items FOR DELETE USING (true);


-- FILE: migration-expense-status.sql 
-- Migration: Add status to expenses
-- Description: Adds a status column to expenses table for approval workflow

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';

-- Optional: update existing rows to be sure
UPDATE public.expenses SET status = 'approved' WHERE status IS NULL;


-- FILE: migration-fix-foreign-key.sql 

-- Migration untuk memperbaiki foreign key constraint di transaction_items
-- Menambahkan ON DELETE CASCADE pada product_id untuk menghindari constraint violation

-- Drop existing foreign key constraint
ALTER TABLE transaction_items 
DROP CONSTRAINT IF EXISTS transaction_items_product_id_fkey;

-- Add new foreign key constraint with ON DELETE CASCADE
ALTER TABLE transaction_items 
ADD CONSTRAINT transaction_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE CASCADE;

-- Catatan: ON DELETE CASCADE berarti jika produk dihapus, 
-- semua transaction_items yang terkait juga akan dihapus secara otomatis
-- Ini mencegah error foreign key violation saat menghapus produk


-- FILE: migration-fmcg-workflow.sql 
-- Migration: FMCG Distribution Workflow
-- Adds stock tracking, transfer/loading sessions, and links transactions to loading sessions.

-- 1. Add stock_quantity to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- 2. Create loading_sessions table
CREATE TABLE IF NOT EXISTS loading_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_id BIGINT REFERENCES staff(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'closed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create loading_items table
CREATE TABLE IF NOT EXISTS loading_items (
  id BIGSERIAL PRIMARY KEY,
  loading_session_id UUID REFERENCES loading_sessions(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity_loaded INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  quantity_returned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL, -- Positive for in, Negative for out
  type VARCHAR(50) NOT NULL, -- 'restock', 'transfer_to_sales', 'return_from_sales', 'adjustment', 'sale'
  reference_id UUID, -- Links to loading_session_id or transaction_id (we use UUID for reference flexibly, or we can use TEXT)
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Change reference_id to TEXT because transaction_id is BIGINT, loading_session_id is UUID
ALTER TABLE stock_movements ALTER COLUMN reference_id TYPE TEXT;

-- 5. Add loading_session_id to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS loading_session_id UUID REFERENCES loading_sessions(id) ON DELETE SET NULL;

-- 6. Enable RLS
ALTER TABLE loading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loading_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (Allow anon for simple kasir login mechanism as per previous setup)
DROP POLICY IF EXISTS "Allow public read on loading_sessions" ON loading_sessions;
CREATE POLICY "Allow public read on loading_sessions" ON loading_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on loading_sessions" ON loading_sessions;
CREATE POLICY "Allow public insert on loading_sessions" ON loading_sessions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on loading_sessions" ON loading_sessions;
CREATE POLICY "Allow public update on loading_sessions" ON loading_sessions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on loading_sessions" ON loading_sessions;
CREATE POLICY "Allow public delete on loading_sessions" ON loading_sessions FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on loading_items" ON loading_items;
CREATE POLICY "Allow public read on loading_items" ON loading_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on loading_items" ON loading_items;
CREATE POLICY "Allow public insert on loading_items" ON loading_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on loading_items" ON loading_items;
CREATE POLICY "Allow public update on loading_items" ON loading_items FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on loading_items" ON loading_items;
CREATE POLICY "Allow public delete on loading_items" ON loading_items FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on stock_movements" ON stock_movements;
CREATE POLICY "Allow public read on stock_movements" ON stock_movements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on stock_movements" ON stock_movements;
CREATE POLICY "Allow public insert on stock_movements" ON stock_movements FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on stock_movements" ON stock_movements;
CREATE POLICY "Allow public update on stock_movements" ON stock_movements FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on stock_movements" ON stock_movements;
CREATE POLICY "Allow public delete on stock_movements" ON stock_movements FOR DELETE USING (true);

-- 8. Triggers for updated_at
DROP TRIGGER IF EXISTS update_loading_sessions_updated_at ON loading_sessions;
CREATE TRIGGER update_loading_sessions_updated_at BEFORE UPDATE ON loading_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loading_items_updated_at ON loading_items;
CREATE TRIGGER update_loading_items_updated_at BEFORE UPDATE ON loading_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- FILE: migration-multi-uom.sql 
-- Migration: Multi Unit of Measure (Multi UOM)
-- Adds product_uoms table for managing multiple units per product (dus, box, pack, pcs)
-- Stock is always stored in pcs (smallest unit), UOM defines conversion factors.

-- 1. Create product_uoms table
CREATE TABLE IF NOT EXISTS product_uoms (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unit_name VARCHAR(50) NOT NULL,        -- 'pcs', 'pack', 'box', 'dus', etc.
  conversion_factor INTEGER NOT NULL DEFAULT 1, -- How many pcs in 1 of this unit
  price DECIMAL(12, 2),                   -- Optional selling price per unit
  barcode VARCHAR(100),                   -- Optional barcode per unit
  sort_order INTEGER DEFAULT 0,           -- Display order (smaller = first)
  is_default BOOLEAN DEFAULT false,       -- Default unit shown in POS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, unit_name)
);

-- 2. Add UOM reference columns to transaction_items
ALTER TABLE transaction_items ADD COLUMN IF NOT EXISTS unit_name VARCHAR(50) DEFAULT 'pcs';
ALTER TABLE transaction_items ADD COLUMN IF NOT EXISTS unit_qty INTEGER;
ALTER TABLE transaction_items ADD COLUMN IF NOT EXISTS conversion_factor INTEGER DEFAULT 1;

-- 3. Add UOM reference columns to stock_movements
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS unit_name VARCHAR(50) DEFAULT 'pcs';
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS unit_qty INTEGER;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS conversion_factor INTEGER DEFAULT 1;

-- 4. Enable RLS
ALTER TABLE product_uoms ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (public access like other shared tables)
DROP POLICY IF EXISTS "Allow public read on product_uoms" ON product_uoms;
CREATE POLICY "Allow public read on product_uoms" ON product_uoms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on product_uoms" ON product_uoms;
CREATE POLICY "Allow public insert on product_uoms" ON product_uoms FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on product_uoms" ON product_uoms;
CREATE POLICY "Allow public update on product_uoms" ON product_uoms FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on product_uoms" ON product_uoms;
CREATE POLICY "Allow public delete on product_uoms" ON product_uoms FOR DELETE USING (true);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_product_uoms_product_id ON product_uoms(product_id);
CREATE INDEX IF NOT EXISTS idx_product_uoms_unit_name ON product_uoms(unit_name);

-- 7. Trigger for updated_at
DROP TRIGGER IF EXISTS update_product_uoms_updated_at ON product_uoms;
CREATE TRIGGER update_product_uoms_updated_at BEFORE UPDATE ON product_uoms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- FILE: migration-payment-confirmation.sql 
-- Migration: Add payment confirmation flow for sales payments
-- Adds status, confirmed_by, and confirmed_at columns to transaction_payments table
-- Default 'confirmed' so existing data is unaffected

ALTER TABLE transaction_payments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS confirmed_by TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Index for faster query of pending payments
CREATE INDEX IF NOT EXISTS idx_transaction_payments_status
  ON transaction_payments (status);


-- FILE: migration-uom-discount.sql 
-- Migration: UOM Discounts
-- Adds discount columns to product_uoms table

ALTER TABLE product_uoms ADD COLUMN IF NOT EXISTS discount_type VARCHAR(10) DEFAULT 'none'; 
-- 'none' | 'amount' | 'percent'
ALTER TABLE product_uoms ADD COLUMN IF NOT EXISTS discount_value DECIMAL(12,2) DEFAULT 0;
-- Nilai diskon (Rp atau %)
ALTER TABLE product_uoms ADD COLUMN IF NOT EXISTS label VARCHAR(100);
-- Label keterangan diskon, e.g. "Beli dus hemat 5%!"
ALTER TABLE product_uoms ADD COLUMN IF NOT EXISTS min_qty INTEGER DEFAULT 1;
-- Minimal kuantitas pembelian agar diskon berlaku


-- FILE: migration-uom-wholesale-tiers.sql 
-- Migration: Support UOM Wholesale / Discount Tiers
-- Description: Drops the UNIQUE constraint on (product_id, unit_name) and replaces it with a UNIQUE constraint on (product_id, unit_name, min_qty)
-- This allows defining multiple wholesale tiers (e.g. 1 box with Rp 0 discount, 5 box with Rp 10.000 discount)

do $$
begin
  -- 1. Drop the old UNIQUE constraint if it exists
  alter table product_uoms drop constraint if exists product_uoms_product_id_unit_name_key;
  
  -- 2. Add the new UNIQUE constraint (product_id, unit_name, min_qty)
  alter table product_uoms add constraint product_uoms_product_id_unit_name_min_qty_key unique (product_id, unit_name, min_qty);
exception
  when others then
    raise notice 'Error altering product_uoms unique constraint: %', sqlerrm;
end;
$$;


-- ============================================
-- Setup app-releases bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-releases', 'app-releases', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view app releases" ON storage.objects FOR SELECT USING (bucket_id = 'app-releases');
CREATE POLICY "Anon can upload app releases" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'app-releases');
CREATE POLICY "Anon can update app releases" ON storage.objects FOR UPDATE TO anon USING (bucket_id = 'app-releases');
CREATE POLICY "Anon can delete app releases" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'app-releases');