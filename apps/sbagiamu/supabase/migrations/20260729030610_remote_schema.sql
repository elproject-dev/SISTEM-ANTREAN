-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION pg_net;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

GRANT SELECT, USAGE ON SEQUENCE public.app_config_id_seq TO anon;

GRANT SELECT, USAGE ON SEQUENCE public.app_config_id_seq TO authenticated;

GRANT SELECT, USAGE ON SEQUENCE public.app_config_id_seq TO service_role;

GRANT SELECT, USAGE ON SEQUENCE public.categories_id_seq TO service_role;

GRANT SELECT, USAGE ON SEQUENCE public.customers_id_seq TO service_role;

GRANT SELECT, USAGE ON SEQUENCE public.outlets_id_seq TO service_role;

GRANT SELECT, USAGE ON SEQUENCE public.products_id_seq TO service_role;

GRANT SELECT, USAGE ON SEQUENCE public.staff_id_seq TO service_role;

GRANT SELECT, USAGE ON SEQUENCE public.transaction_items_id_seq TO service_role;

GRANT SELECT, USAGE ON SEQUENCE public.transactions_id_seq TO service_role;

GRANT ALL ON FUNCTION public.is_admin() TO anon;

GRANT ALL ON FUNCTION public.is_admin() TO service_role;

GRANT ALL ON FUNCTION public.set_owner_id() TO anon;

GRANT ALL ON FUNCTION public.set_owner_id() TO service_role;

GRANT ALL ON FUNCTION public.update_outlets_updated_at() TO anon;

GRANT ALL ON FUNCTION public.update_outlets_updated_at() TO authenticated;

GRANT ALL ON FUNCTION public.update_outlets_updated_at() TO service_role;

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;

GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;

GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;

GRANT DELETE, INSERT, UPDATE ON public.app_config TO anon;

GRANT DELETE, INSERT, UPDATE ON public.app_config TO authenticated;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.categories TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.customers TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.discount_categories TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.discount_settings TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.expense_categories TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.expenses TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.outlets TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.point_settings TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.products TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.profiles TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.staff TO service_role;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.transaction_items TO service_role;

ALTER TABLE public.transactions
  ADD COLUMN order_type character varying(50) DEFAULT 'belum_dipilih'::character varying;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.transactions TO service_role;
