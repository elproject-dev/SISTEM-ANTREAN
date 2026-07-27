CREATE TABLE IF NOT EXISTS store_settings (
  id integer PRIMARY KEY DEFAULT 1,
  name text,
  address text,
  phone text,
  bank_name text,
  bank_account text,
  bank_account_name text,
  bluetooth_store_name text,
  show_footer boolean DEFAULT true,
  footer_message text,
  footer_message2 text,
  footer_message3 text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read on store_settings" ON store_settings;
    DROP POLICY IF EXISTS "Allow admin update on store_settings" ON store_settings;
    DROP POLICY IF EXISTS "Allow admin insert on store_settings" ON store_settings;
    
    CREATE POLICY "Allow public read on store_settings"
      ON store_settings FOR SELECT
      USING (true);

    CREATE POLICY "Allow admin update on store_settings"
      ON store_settings FOR UPDATE
      USING (is_admin())
      WITH CHECK (is_admin());

    CREATE POLICY "Allow admin insert on store_settings"
      ON store_settings FOR INSERT
      WITH CHECK (is_admin());
END $$;

INSERT INTO store_settings (id, name, address, phone, bank_name, bank_account, bank_account_name, bluetooth_store_name, show_footer, footer_message, footer_message2, footer_message3)
VALUES (
  1, 
  'KANTONG-MAS', 
  'Jl. Condongcatur No.123 Yk', 
  '', 
  'BCA', 
  '4451377137', 
  'AULIA USAHA', 
  'KANTONG-MAS', 
  true, 
  '', 
  '', 
  ''
)
ON CONFLICT (id) DO NOTHING;
