/**
 * useQueue — re-export dari useSupabaseQueue
 *
 * File ini sekarang adalah wrapper backward-compatible.
 * Semua data diambil dari Supabase (bukan localStorage).
 *
 * Catatan async: Beberapa action yang dulunya sinkron (return value langsung)
 * kini async (return Promise). Komponen yang menangani return value
 * dari addOfflineTicket & registerOnlineTicket perlu di-await.
 */
export { useSupabaseQueue as useQueue } from './useSupabaseQueue';
