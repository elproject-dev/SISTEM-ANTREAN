ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(12, 2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS transaction_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id BIGINT REFERENCES transactions(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transaction_payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    BEGIN
        CREATE POLICY "Allow public read on transaction_payments" ON transaction_payments FOR SELECT USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END;
    BEGIN
        CREATE POLICY "Allow public insert on transaction_payments" ON transaction_payments FOR INSERT WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN null; END;
    BEGIN
        CREATE POLICY "Allow public update on transaction_payments" ON transaction_payments FOR UPDATE USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END;
    BEGIN
        CREATE POLICY "Allow public delete on transaction_payments" ON transaction_payments FOR DELETE USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END;
END $$;

-- Tambahkan ke realtime
DO $$ BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_payments;
    EXCEPTION WHEN duplicate_object THEN null; WHEN others THEN null; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
    EXCEPTION WHEN duplicate_object THEN null; WHEN others THEN null; END;
END $$;