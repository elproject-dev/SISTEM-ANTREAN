-- ==============================================================================
-- SQL UNTUK MENGAKTIFKAN REALTIME DI SEMUA TABEL
-- Jalankan ini di Supabase Dashboard -> SQL Editor
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Pastikan publication-nya ada
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    -- Looping semua tabel di schema public dan tambahkan ke realtime
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        BEGIN
            EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.' || quote_ident(r.tablename);
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Abaikan jika tabel sudah masuk di realtime
        WHEN OTHERS THEN
            NULL; -- Abaikan error lainnya
        END;
    END LOOP;
END;
$$;