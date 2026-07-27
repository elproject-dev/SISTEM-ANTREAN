/**
 * useSupabaseQueue — pengganti useQueue.ts
 * Semua data disimpan & dibaca dari Supabase (skema "sistem-antrean").
 * Realtime subscription digunakan untuk sinkronisasi antar tab/device.
 *
 * API hook ini identik dengan useQueue.ts agar tidak perlu mengubah halaman.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, db } from '../lib/supabase';
import type {
  DbTicket,
  DbOperatorSession,
  DbService,
  DbRunningText,
  DbStaffUser,
} from '../lib/supabase';
import type {
  QueueState,
  QueueTicket,
  OperatorSession,
  ServiceType,
  RunningTextItem,
  StaffUser,
  ServiceCode,
  QueueType,
  StaffStatus,
} from '../types/queue';
import {
  generateBookingCode,
  formatDisplayNumber,
} from '../types/queue';

// ─── Mapper: DB → App types ───────────────────────────────────────────────────

function mapDbTicket(t: DbTicket): QueueTicket {
  return {
    id: t.id,
    number: t.number,
    displayNumber: t.display_number,
    serviceCode: t.service_code,
    type: t.type,
    status: t.status,
    customerName: t.customer_name ?? undefined,
    customerPhone: t.customer_phone ?? undefined,
    purpose: t.purpose ?? undefined,
    bookingCode: t.booking_code ?? undefined,
    assignedLoket: t.assigned_loket ?? undefined,
    operatorId: t.operator_id ?? undefined,
    operatorName: t.operator_name ?? undefined,
    takenAt: new Date(t.taken_at).getTime(),
    checkedInAt: t.checked_in_at ? new Date(t.checked_in_at).getTime() : undefined,
    assignedAt: t.assigned_at ? new Date(t.assigned_at).getTime() : undefined,
    calledAt: t.called_at ? new Date(t.called_at).getTime() : undefined,
    doneAt: t.done_at ? new Date(t.done_at).getTime() : undefined,
  };
}

function mapDbOperator(o: DbOperatorSession): OperatorSession {
  return {
    id: o.id,
    name: o.name,
    loket: o.loket,
    status: o.status,
    serviceCodes: o.service_codes,
    currentTicketId: o.current_ticket_id ?? undefined,
    totalServed: o.total_served,
    totalSkipped: o.total_skipped,
    loginAt: new Date(o.login_at).getTime(),
    lastActivityAt: new Date(o.last_activity_at).getTime(),
  };
}

function mapDbService(s: DbService): ServiceType {
  return {
    code: s.code,
    name: s.name,
    description: s.description ?? undefined,
  };
}

function mapDbRunningText(r: DbRunningText): RunningTextItem {
  return {
    id: r.id,
    text: r.text,
    isActive: r.is_active,
  };
}

function mapDbStaff(s: DbStaffUser): StaffUser {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: s.role,
    status: s.status,
    createdAt: new Date(s.created_at).getTime(),
  };
}

// ─── Default state (saat loading) ────────────────────────────────────────────
const EMPTY_STATE: QueueState = {
  services: [],
  tickets: [],
  operators: [],
  staffUsers: [],
  counters: {},
  runningTexts: [],
  lastUpdated: Date.now(),
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSupabaseQueue() {
  const [state, setStateRaw] = useState<QueueState>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ─── Load awal semua data ──────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [
        { data: services, error: sErr },
        { data: tickets, error: tErr },
        { data: operators, error: oErr },
        { data: runningTexts, error: rErr },
        { data: staffUsers, error: suErr },
      ] = await Promise.all([
        db.from('services').select('*').eq('is_active', true).order('sort_order'),
        db.from('tickets').select('*').order('taken_at', { ascending: false }),
        db.from('operator_sessions').select('*').neq('status', 'offline'),
        db.from('running_texts').select('*').order('sort_order'),
        db.from('staff_users').select('*').order('created_at'),
      ]);

      const errs = [sErr, tErr, oErr, rErr, suErr].filter(Boolean);
      if (errs.length > 0) {
        console.error('[useSupabaseQueue] Load error:', errs);
        setDbError('Gagal memuat data dari database.');
        setIsLoading(false);
        return;
      }

      // Hitung counters dari tiket hari ini
      const today = new Date().toDateString();
      const todayTickets = (tickets ?? []).filter(t =>
        new Date(t.taken_at).toDateString() === today
      );
      const counters: Record<string, number> = {};
      for (const ticket of todayTickets) {
        counters[ticket.service_code] = Math.max(
          counters[ticket.service_code] ?? 0,
          ticket.number
        );
      }

      setStateRaw({
        services: (services ?? []).map(mapDbService),
        tickets: (tickets ?? []).map(mapDbTicket),
        operators: (operators ?? []).map(mapDbOperator),
        staffUsers: (staffUsers ?? []).map(mapDbStaff),
        counters,
        runningTexts: (runningTexts ?? []).map(mapDbRunningText),
        lastUpdated: Date.now(),
      });
      setDbError(null);
    } catch (err) {
      console.error('[useSupabaseQueue] Unexpected error:', err);
      setDbError('Terjadi kesalahan tak terduga saat memuat data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Setup Realtime ────────────────────────────────────────────────────────
  useEffect(() => {
    loadAll();

    // Buat channel realtime unik per komponen
    const channelName = `queue-${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase
      .channel(channelName, {
        config: { broadcast: { ack: false } },
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'sistem-antrean', table: 'tickets' },
        (payload) => {
          setStateRaw(prev => {
            if (payload.eventType === 'INSERT') {
              const newTicket = mapDbTicket(payload.new as DbTicket);
              // Update counter
              const newCounters = { ...prev.counters };
              newCounters[newTicket.serviceCode] = Math.max(
                newCounters[newTicket.serviceCode] ?? 0,
                newTicket.number
              );
              return {
                ...prev,
                tickets: [newTicket, ...prev.tickets],
                counters: newCounters,
                lastUpdated: Date.now(),
              };
            } else if (payload.eventType === 'UPDATE') {
              const updated = mapDbTicket(payload.new as DbTicket);
              return {
                ...prev,
                tickets: prev.tickets.map(t => t.id === updated.id ? updated : t),
                lastUpdated: Date.now(),
              };
            } else if (payload.eventType === 'DELETE') {
              return {
                ...prev,
                tickets: prev.tickets.filter(t => t.id !== (payload.old as { id: string }).id),
                lastUpdated: Date.now(),
              };
            }
            return prev;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'sistem-antrean', table: 'operator_sessions' },
        (payload) => {
          setStateRaw(prev => {
            if (payload.eventType === 'INSERT') {
              const newOp = mapDbOperator(payload.new as DbOperatorSession);
              return {
                ...prev,
                operators: [...prev.operators, newOp],
                lastUpdated: Date.now(),
              };
            } else if (payload.eventType === 'UPDATE') {
              const updated = mapDbOperator(payload.new as DbOperatorSession);
              if (updated.status === 'offline') {
                return {
                  ...prev,
                  operators: prev.operators.filter(o => o.id !== updated.id),
                  lastUpdated: Date.now(),
                };
              }
              return {
                ...prev,
                operators: prev.operators.map(o => o.id === updated.id ? updated : o),
                lastUpdated: Date.now(),
              };
            } else if (payload.eventType === 'DELETE') {
              return {
                ...prev,
                operators: prev.operators.filter(o => o.id !== (payload.old as { id: string }).id),
                lastUpdated: Date.now(),
              };
            }
            return prev;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'sistem-antrean', table: 'running_texts' },
        () => {
          // Reload running texts saat ada perubahan
          db.from('running_texts').select('*').order('sort_order').then(({ data }) => {
            if (data) {
              setStateRaw(prev => ({
                ...prev,
                runningTexts: data.map(mapDbRunningText),
                lastUpdated: Date.now(),
              }));
            }
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'sistem-antrean', table: 'services' },
        () => {
          // Reload services saat ada perubahan
          db.from('services').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
            if (data) {
              setStateRaw(prev => ({
                ...prev,
                services: data.map(mapDbService),
                lastUpdated: Date.now(),
              }));
            }
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[useSupabaseQueue] Realtime terhubung ✓');
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [loadAll]);


  /** Tambah nomor antrean baru */
  const addOfflineTicket = useCallback(async (
    serviceCode: ServiceCode,
    _customNumber?: number,
    ticketType: QueueType = 'offline'
  ): Promise<QueueTicket> => {
    const currentMax = state.counters[serviceCode] ?? 0;
    const num = currentMax + 1;
    const displayNumber = formatDisplayNumber(serviceCode, num);

    const { data, error } = await db
      .from('tickets')
      .insert({
        number: num,
        display_number: displayNumber,
        service_code: serviceCode,
        type: ticketType,
        status: 'waiting',
        taken_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[addOfflineTicket] Error:', error);
      throw new Error('Gagal menambah tiket: ' + error?.message);
    }

    // Update counter lokal
    setStateRaw(prev => ({
      ...prev,
      counters: { ...prev.counters, [serviceCode]: num },
    }));

    return mapDbTicket(data as DbTicket);
  }, [state.counters]);

  /** Daftar antrean online */
  const registerOnlineTicket = useCallback(async (
    serviceCode: ServiceCode,
    customerName: string,
    customerPhone: string,
    purpose: string
  ): Promise<QueueTicket> => {
    const currentMax = state.counters[serviceCode] ?? 0;
    const num = currentMax + 1;
    const displayNumber = formatDisplayNumber(serviceCode, num);
    const bookingCode = generateBookingCode();

    const { data, error } = await db
      .from('tickets')
      .insert({
        number: num,
        display_number: displayNumber,
        service_code: serviceCode,
        type: 'online',
        status: 'pending_checkin',
        customer_name: customerName,
        customer_phone: customerPhone,
        purpose,
        booking_code: bookingCode,
        taken_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Gagal mendaftar antrean online: ' + error?.message);
    }

    setStateRaw(prev => ({
      ...prev,
      counters: { ...prev.counters, [serviceCode]: num },
    }));

    return mapDbTicket(data as DbTicket);
  }, [state.counters]);

  /** Check-in tiket online */
  const checkInOnlineTicket = useCallback(async (bookingCode: string): Promise<QueueTicket | null> => {
    const ticket = state.tickets.find(
      t => t.bookingCode === bookingCode.toUpperCase() && t.status === 'pending_checkin'
    );
    if (!ticket) return null;

    const { data, error } = await db
      .from('tickets')
      .update({
        status: 'waiting',
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', ticket.id)
      .select()
      .single();

    if (error || !data) return null;
    return mapDbTicket(data as DbTicket);
  }, [state.tickets]);

  /** Assign tiket ke operator/loket */
  const assignTicketToOperator = useCallback(async (
    ticketId: string,
    operatorId: string
  ): Promise<boolean> => {
    const ticket = state.tickets.find(t => t.id === ticketId && t.status === 'waiting');
    const operator = state.operators.find(o => o.id === operatorId && o.status !== 'offline');
    if (!ticket || !operator) return false;

    const { error } = await db
      .from('tickets')
      .update({
        assigned_loket: operator.loket,
        operator_id: operator.id,
        operator_name: operator.name,
        assigned_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    return !error;
  }, [state.tickets, state.operators]);

  // ─── OPERATOR ACTIONS ─────────────────────────────────────────────────────

  /** Operator panggil tiket */
  const callAssignedTicket = useCallback(async (
    operatorId: string,
    ticketId: string
  ): Promise<boolean> => {
    const ticket = state.tickets.find(t => t.id === ticketId && t.status === 'waiting' && (!t.operatorId || t.operatorId === operatorId));
    const operator = state.operators.find(o => o.id === operatorId && o.status === 'available');
    if (!ticket || !operator) return false;

    const [{ error: tErr }, { error: oErr }] = await Promise.all([
      db.from('tickets').update({
        status: 'calling',
        operator_id: operator.id,
        operator_name: operator.name,
        assigned_loket: operator.loket,
        called_at: new Date().toISOString(),
      }).eq('id', ticketId),
      db.from('operator_sessions').update({
        status: 'busy',
        current_ticket_id: ticketId,
        last_activity_at: new Date().toISOString(),
      }).eq('id', operatorId),
    ]);

    if (tErr || oErr) {
      console.error('[callAssignedTicket]', tErr, oErr);
      return false;
    }

    // Update state lokal untuk lastCalledTicketId
    setStateRaw(prev => ({ ...prev, lastCalledTicketId: ticketId }));
    return true;
  }, [state.tickets, state.operators]);

  /** Panggil ulang */
  const recallTicket = useCallback(async (operatorId: string): Promise<void> => {
    const op = state.operators.find(o => o.id === operatorId);
    if (!op?.currentTicketId) return;

    await db.from('tickets').update({
      status: 'calling',
      called_at: new Date().toISOString(),
    }).eq('id', op.currentTicketId);

    setStateRaw(prev => ({ ...prev, lastCalledTicketId: op.currentTicketId }));
  }, [state.operators]);

  /** Selesai melayani */
  const completeTicket = useCallback(async (operatorId: string): Promise<void> => {
    const op = state.operators.find(o => o.id === operatorId);
    if (!op?.currentTicketId) return;

    await Promise.all([
      db.from('tickets').update({
        status: 'done',
        done_at: new Date().toISOString(),
      }).eq('id', op.currentTicketId),
      db.from('operator_sessions').update({
        status: 'available',
        current_ticket_id: null,
        total_served: op.totalServed + 1,
        last_activity_at: new Date().toISOString(),
      }).eq('id', operatorId),
    ]);
  }, [state.operators]);

  /** Skip tiket */
  const skipTicket = useCallback(async (operatorId: string): Promise<void> => {
    const op = state.operators.find(o => o.id === operatorId);
    if (!op?.currentTicketId) return;

    await Promise.all([
      db.from('tickets').update({
        status: 'skipped',
      }).eq('id', op.currentTicketId),
      db.from('operator_sessions').update({
        status: 'available',
        current_ticket_id: null,
        total_skipped: op.totalSkipped + 1,
        last_activity_at: new Date().toISOString(),
      }).eq('id', operatorId),
    ]);
  }, [state.operators]);

  // ─── SERVICE MANAGEMENT ───────────────────────────────────────────────────

  const addService = useCallback(async (service: ServiceType): Promise<void> => {
    await db.from('services').upsert({
      code: service.code,
      name: service.name,
      description: service.description ?? null,
      is_active: true,
      sort_order: state.services.length,
    });
  }, [state.services.length]);

  const updateService = useCallback(async (code: string, updates: Partial<ServiceType>): Promise<void> => {
    await db.from('services').update({
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description ?? null }),
    }).eq('code', code);
  }, []);

  const deleteService = useCallback(async (code: string): Promise<void> => {
    await db.from('services').update({ is_active: false }).eq('code', code);
  }, []);

  const resetCounter = useCallback(async (code: string): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];
    await db.from('counters').upsert(
      { service_code: code, date: today, value: 0 },
      { onConflict: 'service_code,date' }
    );
    setStateRaw(prev => ({
      ...prev,
      counters: { ...prev.counters, [code]: 0 },
    }));
  }, []);

  // ─── OPERATOR SESSION ─────────────────────────────────────────────────────

  const registerOperator = useCallback(async (
    name: string,
    loket: number,
    serviceCodes: ServiceCode[]
  ): Promise<OperatorSession> => {
    // Hapus sesi lama untuk loket ini jika ada
    await db.from('operator_sessions').delete().eq('loket', loket);

    const { data, error } = await db
      .from('operator_sessions')
      .insert({
        name,
        loket,
        status: 'available',
        service_codes: serviceCodes,
        total_served: 0,
        total_skipped: 0,
        login_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Gagal registrasi operator: ' + error?.message);
    }

    return mapDbOperator(data as DbOperatorSession);
  }, []);

  const setOperatorStatus = useCallback(async (
    operatorId: string,
    status: OperatorSession['status']
  ): Promise<void> => {
    await db.from('operator_sessions').update({
      status,
      last_activity_at: new Date().toISOString(),
    }).eq('id', operatorId);
  }, []);

  const logoutOperator = useCallback(async (operatorId: string): Promise<void> => {
    await db.from('operator_sessions').delete().eq('id', operatorId);
  }, []);

  /** Reset SEMUA antrean hari ini */
  const resetAll = useCallback(async (): Promise<void> => {
    // Hapus semua tiket hari ini
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    await db.from('tickets').delete().gte('taken_at', todayStart.toISOString());
    // Hapus semua sesi operator
    await db.from('operator_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Reset counters
    const today = new Date().toISOString().split('T')[0];
    for (const svc of state.services) {
      await db.from('counters').upsert(
        { service_code: svc.code, date: today, value: 0 },
        { onConflict: 'service_code,date' }
      );
    }
    await loadAll();
  }, [state.services, loadAll]);

  // ─── RUNNING TEXT ACTIONS ─────────────────────────────────────────────────

  const addRunningText = useCallback(async (text: string): Promise<void> => {
    await db.from('running_texts').insert({
      text,
      is_active: true,
      sort_order: state.runningTexts.length,
    });
  }, [state.runningTexts.length]);

  const updateRunningText = useCallback(async (id: string, text: string, isActive: boolean): Promise<void> => {
    await db.from('running_texts').update({ text, is_active: isActive }).eq('id', id);
  }, []);

  const deleteRunningText = useCallback(async (id: string): Promise<void> => {
    await db.from('running_texts').delete().eq('id', id);
  }, []);

  // ─── STAFF MANAGEMENT ────────────────────────────────────────────────────

  const registerStaff = useCallback(async (
    staff: Omit<StaffUser, 'id' | 'createdAt'>
  ): Promise<void> => {
    const { error } = await db.from('staff_users').insert({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      status: staff.status,
      auth_id: null, // auth_id di-set saat user sign up via useAuth
    });
    if (error) throw new Error('Gagal mendaftar staff: ' + error.message);
    // Reload staff list
    const { data } = await db.from('staff_users').select('*').order('created_at');
    if (data) setStateRaw(prev => ({ ...prev, staffUsers: data.map(mapDbStaff) }));
  }, []);

  const updateStaff = useCallback(async (
    id: string,
    data: Partial<Omit<StaffUser, 'id' | 'createdAt'>>
  ): Promise<void> => {
    await db.from('staff_users').update({
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.role && { role: data.role }),
      ...(data.status && { status: data.status }),
    }).eq('id', id);
    // Reload staff list
    const { data: freshData } = await db.from('staff_users').select('*').order('created_at');
    if (freshData) setStateRaw(prev => ({ ...prev, staffUsers: freshData.map(mapDbStaff) }));
  }, []);

  const updateStaffStatus = useCallback(async (id: string, status: StaffStatus): Promise<void> => {
    await db.from('staff_users').update({ status }).eq('id', id);
    setStateRaw(prev => ({
      ...prev,
      staffUsers: prev.staffUsers.map(s => s.id === id ? { ...s, status } : s),
    }));
  }, []);

  const deleteStaff = useCallback(async (id: string): Promise<void> => {
    await db.from('staff_users').delete().eq('id', id);
    setStateRaw(prev => ({
      ...prev,
      staffUsers: prev.staffUsers.filter(s => s.id !== id),
    }));
  }, []);

  // ─── Derived ─────────────────────────────────────────────────────────────
  const waitingTickets = state.tickets.filter(t => t.status === 'waiting');
  const pendingCheckinTickets = state.tickets.filter(t => t.status === 'pending_checkin');
  const callingTickets = state.tickets.filter(t => t.status === 'calling' || t.status === 'serving');
  const doneTickets = state.tickets.filter(t => t.status === 'done');
  const availableOperators = state.operators.filter(o => o.status === 'available');
  const busyOperators = state.operators.filter(o => o.status === 'busy');
  const onlineOperators = state.operators.filter(o => o.status !== 'offline');

  return {
    state,
    isLoading,
    dbError,
    reload: loadAll,
    waitingTickets,
    pendingCheckinTickets,
    callingTickets,
    doneTickets,
    availableOperators,
    busyOperators,
    onlineOperators,
    // Admin
    addOfflineTicket,
    registerOnlineTicket,
    checkInOnlineTicket,
    assignTicketToOperator,
    // Operator
    callAssignedTicket,
    recallTicket,
    completeTicket,
    skipTicket,
    // Session
    registerOperator,
    setOperatorStatus,
    logoutOperator,
    resetAll,
    // Services
    addService,
    updateService,
    deleteService,
    resetCounter,
    // Running Text
    addRunningText,
    updateRunningText,
    deleteRunningText,
    // Staff
    registerStaff,
    updateStaffStatus,
    updateStaff,
    deleteStaff,
  };
}
