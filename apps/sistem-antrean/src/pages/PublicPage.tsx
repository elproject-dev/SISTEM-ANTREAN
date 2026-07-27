import { useState } from 'react';
import { useQueue } from '../hooks/useQueue';
import type { ServiceCode, QueueTicket } from '../types/queue';
import { CustomStatusBadge, type BadgeVariant } from '../components/CustomStatusBadge';
import {
  Button, Badge, Card, CardContent, CardHeader, CardTitle,
} from '@elproject/ui';

// ─── QR Code placeholder ──────────────────────────────────────────────────────
function BookingQRCode({ code }: { code: string }) {
  // Visual QR placeholder (real QR needs library)
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-36 h-36 border-4 border-foreground rounded-xl flex flex-col items-center justify-center gap-2 bg-white relative overflow-hidden">
        {/* Simplified QR visual using grid */}
        <div className="absolute inset-0 grid grid-cols-7 grid-rows-7 p-2 gap-0.5">
          {Array.from({ length: 49 }).map((_, i) => {
            // Create a somewhat QR-looking pattern
            const row = Math.floor(i / 7);
            const col = i % 7;
            const isBorder = (row < 2 || row > 4) && (col < 2 || col > 4);
            const isCode = (i + code.charCodeAt(i % code.length)) % 3 === 0;
            return (
              <div
                key={i}
                className={`rounded-sm ${isBorder || isCode ? 'bg-foreground' : 'bg-transparent'}`}
              />
            );
          })}
        </div>
        <span className="relative z-10 text-xs font-mono font-black bg-white px-1 rounded text-center">
          {code}
        </span>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Tunjukkan kode ini saat check-in
      </p>
    </div>
  );
}

// ─── Form daftar online ───────────────────────────────────────────────────────
function RegisterForm({ onRegister, services }: {
  onRegister: (code: ServiceCode, name: string, phone: string, purpose: string) => Promise<QueueTicket>;
  services: import('../types/queue').ServiceType[];
}) {
  const [step, setStep] = useState<'form' | 'ticket'>('form');
  const [ticket, setTicket] = useState<QueueTicket | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', service: 'A' as ServiceCode });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const t = await onRegister(form.service, form.name.trim(), form.phone.trim(), form.purpose.trim());
      setTicket(t);
      setStep('ticket');
    } catch (err) {
      console.error('[PublicPage] Error daftar online:', err);
      alert('Gagal mendaftar antrean. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setTicket(null);
    setForm({ name: '', phone: '', purpose: '', service: 'A' });
  };

  if (step === 'ticket' && ticket) {
    return (
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Nomor Antrean Online Anda
          </span>
          <span className="text-8xl font-black text-primary leading-none">{ticket.displayNumber}</span>
          <div className="flex gap-2 mt-2">
            <Badge variant="default" className="text-xs">🌐 Online</Badge>
            <Badge variant="secondary" className="text-xs">
              {services.find((s) => s.code === ticket.serviceCode)?.name}
            </Badge>
          </div>
        </div>

        {ticket.bookingCode && <BookingQRCode code={ticket.bookingCode} />}

        <div className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kode Booking</span>
            <code className="font-mono font-black text-primary">{ticket.bookingCode}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nama</span>
            <span className="font-semibold">{ticket.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Keperluan</span>
            <span className="font-semibold">{ticket.purpose}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Waktu Daftar</span>
            <span className="font-semibold">
              {new Date(ticket.takenAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
            <p className="font-bold mb-1">📌 Langkah Selanjutnya:</p>
            <ol className="list-decimal ml-4 space-y-1 text-xs">
              <li>Simpan atau screenshot kode booking ini</li>
              <li>Datang ke kantor sebelum antrean Anda dipanggil</li>
              <li>Tunjukkan kode ke petugas untuk check-in</li>
              <li>Pantau antrean di halaman ini</li>
            </ol>
          </div>
        </div>

        <Button variant="outline" onClick={handleReset} className="w-full">
          Daftar Antrean Lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Jenis Layanan</label>
        <div className="grid grid-cols-2 gap-2">
          {services.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => setForm((f) => ({ ...f, service: s.code }))}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm text-left transition-all ${
                form.service === s.code
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border hover:border-primary/30'
              }`}
            >

              <div className="flex flex-col">
                <span className="font-bold text-xs">{s.name}</span>
                <span className="text-xs text-muted-foreground leading-snug hidden sm:block">{s.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {[
        { key: 'name', label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap...', type: 'text' },
        { key: 'phone', label: 'Nomor HP/WA', placeholder: '08xx-xxxx-xxxx', type: 'tel' },
        { key: 'purpose', label: 'Keperluan / Keterangan', placeholder: 'Jelaskan keperluan Anda...', type: 'text' },
      ].map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{field.label}</label>
          <input
            type={field.type}
            required
            value={(form as any)[field.key]}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      ))}

      <Button type="submit" size="lg" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? '⏳ Memproses...' : '🎫 Ambil Nomor Antrean Online'}
      </Button>
    </form>
  );
}

// ─── Queue Tracker ────────────────────────────────────────────────────────────
function QueueTracker() {
  const { state, waitingTickets } = useQueue();
  const [bookingCode, setBookingCode] = useState('');
  const [found, setFound] = useState<{ ticket: QueueTicket; position: number } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const code = bookingCode.toUpperCase().trim();
    const ticket = state.tickets.find((t) => t.bookingCode === code);
    if (!ticket) { setFound(null); return; }
    const position = waitingTickets
      .filter((t) => t.serviceCode === ticket.serviceCode)
      .sort((a, b) => a.takenAt - b.takenAt)
      .findIndex((t) => t.id === ticket.id) + 1;
    setFound({ ticket, position });
  };

  const statusLabel: Record<string, { text: string; variant: BadgeVariant }> = {
    pending_checkin: { text: 'Menunggu Check-in', variant: 'purple' },
    waiting: { text: 'Dalam Antrean', variant: 'info' },
    calling: { text: 'Sedang Dipanggil!', variant: 'warning' },
    serving: { text: 'Sedang Dilayani', variant: 'active' },
    done: { text: 'Selesai Dilayani', variant: 'slate' },
    skipped: { text: 'Dilewati', variant: 'error' },
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={bookingCode}
          onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
          placeholder="Masukkan kode booking..."
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <Button type="submit">Cek</Button>
      </form>

      {found && (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-black text-primary">{found.ticket.displayNumber}</p>
              <p className="text-xs text-muted-foreground">{found.ticket.customerName}</p>
            </div>
            <CustomStatusBadge 
              variant={statusLabel[found.ticket.status]?.variant || 'slate'} 
              label={statusLabel[found.ticket.status]?.text} 
            />
          </div>
          {found.ticket.status === 'waiting' && found.position > 0 && (
            <div className="rounded-lg bg-muted/40 px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Posisi Antrean</p>
              <p className="text-3xl font-black text-foreground">{found.position}</p>
              <p className="text-xs text-muted-foreground">dari depan</p>
            </div>
          )}
          {found.ticket.status === 'calling' && (
            <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-center">
              <p className="text-orange-700 font-bold text-sm">📣 Anda sedang dipanggil!</p>
              <p className="text-orange-600 text-xs mt-1">Segera menuju Loket {found.ticket.assignedLoket}</p>
            </div>
          )}
          {found.ticket.status === 'pending_checkin' && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-700">
              Antrean Anda terdaftar. Datang ke kantor dan tunjukkan kode <strong>{found.ticket.bookingCode}</strong> ke petugas untuk check-in.
            </div>
          )}
        </div>
      )}

      {bookingCode && !found && (
        <p className="text-center text-sm text-muted-foreground py-2">
          Kode tidak ditemukan. Pastikan kode booking Anda benar.
        </p>
      )}
    </div>
  );
}

// ─── Main Public Page ─────────────────────────────────────────────────────────
export function PublicPage() {
  const { registerOnlineTicket, waitingTickets, state } = useQueue();
  const [activeTab, setActiveTab] = useState<'daftar' | 'cek'>('daftar');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-5 py-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black leading-none">🌐 Antrean Online</h1>
            <p className="text-primary-foreground/70 text-xs mt-0.5">Daftar dari mana saja, kapan saja</p>
          </div>
          <nav className="flex gap-2">
            {([
              { href: '#/', label: 'Kiosk' },
              { href: '#/tv', label: '📺 TV' },
            ] as const).map((l) => (
              <a key={l.href} href={l.href} className="text-xs text-primary-foreground/60 hover:text-primary-foreground border border-primary-foreground/20 rounded px-2 py-1 transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Menunggu', value: waitingTickets.length, icon: '⏳' },
            { label: 'Selesai Hari Ini', value: state.tickets.filter((t) => t.status === 'done').length, icon: '✅' },
            { label: 'Terdaftar Online', value: state.tickets.filter((t) => t.type === 'online').length, icon: '🌐' },
          ].map((s) => (
            <Card key={s.label} className="text-center py-4">
              <span className="text-xl">{s.icon}</span>
              <div className="text-2xl font-black text-primary mt-1">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['daftar', 'cek'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'daftar' ? '🎫 Daftar Antrean' : '🔍 Cek Status'}
            </button>
          ))}
        </div>

        {activeTab === 'daftar' ? (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Daftar Antrean Online</CardTitle>
              <p className="text-xs text-muted-foreground">
                Isi form berikut untuk mendapatkan nomor antrean digital dengan kode booking
              </p>
            </CardHeader>
            <CardContent>
              <RegisterForm onRegister={registerOnlineTicket} services={state.services} />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Cek Status Antrean</CardTitle>
              <p className="text-xs text-muted-foreground">
                Masukkan kode booking 6 karakter untuk melihat posisi antrean Anda
              </p>
            </CardHeader>
            <CardContent>
              <QueueTracker />
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-5">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">📋 Alur Antrean Online</h3>
            <div className="flex flex-col gap-2.5">
              {[
                { step: '1', text: 'Isi form dan dapatkan kode booking', icon: '📝' },
                { step: '2', text: 'Pantau posisi antrean dari HP', icon: '📱' },
                { step: '3', text: 'Datang ke kantor sebelum nomor dipanggil', icon: '🚶' },
                { step: '4', text: 'Tunjukkan kode ke petugas untuk check-in', icon: '✅' },
                { step: '5', text: 'Masuk ke antrean dan tunggu panggilan', icon: '🔔' },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </span>
                  <span className="text-muted-foreground">{s.icon} {s.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
