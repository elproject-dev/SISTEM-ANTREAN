// ─── Tipe Layanan ─────────────────────────────────────────────────────────────
export type ServiceCode = string;

export interface ServiceType {
  code: ServiceCode;
  name: string;
  description?: string;
}

export const SERVICES: ServiceType[] = [
  { code: 'A', name: 'Pelayanan Umum', description: 'Informasi, surat keterangan, layanan umum' },
  { code: 'B', name: 'Keuangan', description: 'Pembayaran, tagihan, dan layanan keuangan' },
  { code: 'C', name: 'Administrasi', description: 'Pendaftaran, perizinan, dan dokumen resmi' },
  { code: 'D', name: 'Teknis', description: 'Konsultasi teknis dan bantuan operasional' },
];

// ─── Tipe & Status Antrean ────────────────────────────────────────────────────
export type QueueType = 'offline' | 'online' | 'priority';

export type QueueStatus =
  | 'pending_checkin'   // Online: menunggu check-in di lokasi
  | 'waiting'           // Di kolam, menunggu assign ke operator
  | 'calling'           // Dipanggil oleh operator (TTS aktif)
  | 'serving'           // Sedang dilayani
  | 'done'              // Selesai dilayani
  | 'skipped';          // Dilewati

export interface QueueTicket {
  id: string;
  number: number;
  displayNumber: string;       // e.g. "A-007"
  serviceCode: ServiceCode;
  type: QueueType;
  status: QueueStatus;
  // Data pelanggan (khusus online)
  customerName?: string;
  customerPhone?: string;
  purpose?: string;
  bookingCode?: string;        // Kode unik untuk check-in
  // Data penugasan
  assignedLoket?: number;
  operatorId?: string;
  operatorName?: string;
  // Timestamps
  takenAt: number;
  checkedInAt?: number;
  assignedAt?: number;
  calledAt?: number;
  doneAt?: number;
}

// ─── Operator ─────────────────────────────────────────────────────────────────
export type OperatorStatus = 'available' | 'busy' | 'offline';

export interface OperatorSession {
  id: string;
  name: string;
  loket: number;
  status: OperatorStatus;
  serviceCodes: ServiceCode[];
  currentTicketId?: string;
  totalServed: number;
  totalSkipped: number;
  loginAt: number;
  lastActivityAt: number;
}

// ─── Running Text ─────────────────────────────────────────────────────────────
export interface RunningTextItem {
  id: string;
  text: string;
  isActive: boolean;
}

// ─── Staff & Users ────────────────────────────────────────────────────────────
export type StaffRole = 'admin' | 'operator';
export type StaffStatus = 'pending' | 'active' | 'inactive';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // In real app, this should be hashed
  role: StaffRole;
  status: StaffStatus;
  createdAt: number;
}

// ─── State Global ─────────────────────────────────────────────────────────────
export type QueueCounters = Record<string, number>;

export interface QueueState {
  services: ServiceType[];
  tickets: QueueTicket[];
  operators: OperatorSession[];
  staffUsers: StaffUser[];
  counters: QueueCounters;
  runningTexts: RunningTextItem[];
  /** ID tiket yang terakhir dipanggil (untuk TTS di TV) */
  lastCalledTicketId?: string;
  lastUpdated: number;
}

// ─── Admin config ─────────────────────────────────────────────────────────────
export const MAX_OPERATORS = 5;
export const LOKET_NUMBERS = [1, 2, 3, 4, 5];

// ─── Storage ──────────────────────────────────────────────────────────────────
export const STORAGE_KEY = 'sistem_antrean_v2_state';
export const BROADCAST_CHANNEL = 'antrean_v2_sync';

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function formatDisplayNumber(code: ServiceCode, number: number): string {
  return `${code}-${String(number).padStart(3, '0')}`;
}
