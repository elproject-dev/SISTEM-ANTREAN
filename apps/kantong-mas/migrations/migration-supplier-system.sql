-- Migration: Create supplier system tables
-- Description: Creates supplier_transactions and supplier_returns tables with JSONB items

-- Create supplier_transactions table
CREATE TABLE IF NOT EXISTS supplier_transactions (
  id VARCHAR(100) PRIMARY KEY,
  invoice_id VARCHAR(255),
  supplier_name VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  down_payment DECIMAL(12, 2) DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  is_transferred BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  outlet_id BIGINT REFERENCES outlets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supplier_returns table
CREATE TABLE IF NOT EXISTS supplier_returns (
  id VARCHAR(100) PRIMARY KEY,
  transaction_id VARCHAR(100),
  invoice_id VARCHAR(255),
  supplier_name VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason VARCHAR(255),
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_refund DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Diproses',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  outlet_id BIGINT REFERENCES outlets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE supplier_transactions IS 'Table for tracking supplier purchases and debts';
COMMENT ON TABLE supplier_returns IS 'Table for tracking supplier returns';

-- Enable RLS
ALTER TABLE supplier_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_returns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supplier_transactions
CREATE POLICY "supplier_transactions_select" ON supplier_transactions
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR owner_id IS NULL
    OR auth.uid() IS NULL
  );

CREATE POLICY "supplier_transactions_insert" ON supplier_transactions
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
    OR auth.uid() IS NULL
  );

CREATE POLICY "supplier_transactions_update" ON supplier_transactions
  FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR owner_id IS NULL
    OR auth.uid() IS NULL
  );

CREATE POLICY "supplier_transactions_delete" ON supplier_transactions
  FOR DELETE
  USING (
    owner_id = auth.uid()
    OR auth.uid() IS NULL
  );

-- RLS Policies for supplier_returns
CREATE POLICY "supplier_returns_select" ON supplier_returns
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR owner_id IS NULL
    OR auth.uid() IS NULL
  );

CREATE POLICY "supplier_returns_insert" ON supplier_returns
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
    OR auth.uid() IS NULL
  );

CREATE POLICY "supplier_returns_update" ON supplier_returns
  FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR owner_id IS NULL
    OR auth.uid() IS NULL
  );

CREATE POLICY "supplier_returns_delete" ON supplier_returns
  FOR DELETE
  USING (
    owner_id = auth.uid()
    OR auth.uid() IS NULL
  );

-- Create publication for realtime if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'supplier_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE supplier_transactions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'supplier_returns'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE supplier_returns;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback for environments without publication setup
    NULL;
END
$$;
