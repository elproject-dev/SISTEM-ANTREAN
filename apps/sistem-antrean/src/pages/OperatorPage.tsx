import { useState, useEffect } from 'react';
import { useQueue } from '../hooks/useQueue';
import type { OperatorSession, ServiceCode } from '../types/queue';
import { SERVICES, LOKET_NUMBERS } from '../types/queue';
import {
  Badge,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@elproject/ui';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { KpiCard } from '../components/KpiCard';
import { CustomButton } from '../components/CustomButton';
import { CustomStatusBadge, type BadgeVariant } from '../components/CustomStatusBadge';
import { LogOut, User, RefreshCw, SkipForward, Check, CheckCircle2, XCircle, Clock } from 'lucide-react';

// ─── Login Form ───────────────────────────────────────────────────────────────
function OperatorLoginForm({ onLogin }: { onLogin: (name: string, loket: number, services: ServiceCode[]) => void }) {
  const { state } = useQueue();
  const operatorStaff = state.staffUsers.filter(u => u.role === 'operator' && u.status === 'active');

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [loket, setLoket] = useState('1');
  const [services, setServices] = useState<ServiceCode[]>([]);
  const [error, setError] = useState('');
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const toggleService = (code: ServiceCode) =>
    setServices((p) => p.includes(code) ? p.filter((c) => c !== code) : [...p, code]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStaffId) {
      setError('Silakan pilih operator terlebih dahulu.');
      return;
    }
    if (services.length === 0) {
      setError('Silakan pilih minimal satu layanan.');
      return;
    }

    const staff = operatorStaff.find(u => u.id === selectedStaffId);
    if (!staff) {
      setError('Operator tidak valid.');
      return;
    }

    onLogin(staff.name, parseInt(loket), services);
  };

  // Tutup dropdown layanan saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.services-dropdown')) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen items-center justify-center p-4 w-full animate-in fade-in duration-300">
      <div className="w-full max-w-md">
        <div className="bg-amber-50/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-500/10 border border-orange-200/60">
          <div className="p-8 text-center bg-gradient-to-br from-orange-500 to-amber-500 border-b border-orange-600/50 text-white rounded-t-3xl">
            <h1 className="text-2xl font-black">Login Operator</h1>
            <p className="text-sm font-medium mt-1 text-white/90">Sistem Antrean Terpadu</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                <XCircle size={18} /> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nama Operator</label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger className="w-full h-[48px] bg-white border-slate-200 text-sm rounded-xl font-medium focus:ring-4 focus:ring-primary/10">
                  <SelectValue placeholder="Pilih operator..." />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-lg border-slate-200 rounded-xl">
                  {operatorStaff.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500 text-center">Belum ada operator terdaftar.</div>
                  ) : (
                    operatorStaff.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="font-medium hover:bg-slate-50">
                        {u.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nomor Loket</label>
              <Select value={loket} onValueChange={setLoket}>
                <SelectTrigger className="w-full h-[48px] bg-white border-slate-200 text-sm rounded-xl font-medium focus:ring-4 focus:ring-primary/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-lg border-slate-200 rounded-xl">
                  {LOKET_NUMBERS.map((n) => (
                    <SelectItem key={n} value={String(n)} className="font-medium hover:bg-slate-50">Loket {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 services-dropdown relative">
              <label className="text-sm font-bold text-slate-700">Layanan yang Ditangani</label>
              <button
                type="button"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="w-full h-[48px] bg-white border border-slate-200 text-sm rounded-xl font-medium px-3 flex items-center justify-between hover:bg-white/80 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                <span className={services.length === 0 ? "text-slate-500" : "text-slate-800"}>
                  {services.length === 0
                    ? "Pilih layanan..."
                    : `${services.length} layanan dipilih`}
                </span>
                <div className="text-slate-400">▼</div>
              </button>

              {isServicesOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white shadow-xl border border-slate-200 rounded-xl z-10 flex flex-col gap-1">
                  {SERVICES.map((s) => {
                    const active = services.includes(s.code);
                    return (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => toggleService(s.code)}
                        className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-all text-left font-bold ${active
                            ? 'bg-orange-100 text-orange-600 border border-orange-200'
                            : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <span className="truncate">{s.name} ({s.code})</span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${active ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-white border-slate-300 shadow-inner'}`}>
                          {active && <Check size={14} strokeWidth={4} color="white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <CustomButton
              type="submit"
              variant="primary"
              className="w-full py-4 text-base mt-4"
              disabled={!selectedStaffId || services.length === 0}
            >
              <User size={20} /> Masuk
            </CustomButton>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Operator Dashboard ───────────────────────────────────────────────────────
function OperatorDashboard({ operator, onLogout }: { operator: OperatorSession; onLogout: () => void }) {
  const { state, callAssignedTicket, recallTicket, completeTicket, skipTicket, setOperatorStatus } = useQueue();
  const [recallAnim, setRecallAnim] = useState(false);

  // Sync operator from global state
  const liveOp = state.operators.find((o) => o.id === operator.id) ?? operator;
  const currentTicket = liveOp.currentTicketId
    ? state.tickets.find((t) => t.id === liveOp.currentTicketId)
    : null;

  const isOnline = liveOp.status !== 'offline';

  const handleRecall = async () => {
    await recallTicket(liveOp.id);
    setRecallAnim(true);
    setTimeout(() => setRecallAnim(false), 1200);
  };

  const handleToggle = async (v: boolean) => {
    await setOperatorStatus(liveOp.id, v ? 'available' : 'offline');
  };

  // Get all tickets handled by this operator, including current calling ticket in the history 
  // Wait, the prompt says "Daftar antrean yang sudah Anda tangani". Let's show only "done" and "skipped" in history.
  const servedToday = state.tickets.filter(
    (t) => (t.status === 'done' || t.status === 'skipped') && t.operatorId === liveOp.id && t.calledAt
  );

  const waitingTickets = state.tickets
    .filter((t) => 
      t.status === 'waiting' && 
      (!t.operatorId || t.operatorId === liveOp.id) && 
      liveOp.serviceCodes.includes(t.serviceCode)
    )
    .sort((a, b) => a.takenAt - b.takenAt);

  const avgSeconds = servedToday.length > 0
    ? Math.round(servedToday.reduce((s, t) => s + ((t.doneAt || Date.now()) - t.calledAt!), 0) / servedToday.length / 1000)
    : 0;

  const STATUS_LABEL: Record<string, { label: string; variant: BadgeVariant }> = {
    waiting: { label: 'Menunggu', variant: 'slate' },
    calling: { label: 'Diproses', variant: 'warning' },
    serving: { label: 'Dilayani', variant: 'info' },
    done: { label: 'Selesai', variant: 'success' },
    skipped: { label: 'Dilewati', variant: 'error' },
    pending_checkin: { label: 'Pending', variant: 'purple' },
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 md:p-8">
      {/* ── Header ── */}
      <PageHeaderCard
        title={`Dashboard Loket ${liveOp.loket}`}
        subtitle={`Selamat bertugas, ${liveOp.name}`}
        showProfile={false}
      >
        <div className="flex items-center gap-4 bg-transparent px-4 py-2 rounded-xl">
          <button
            onClick={() => handleToggle(!isOnline)}
            className={`relative flex items-center gap-2.5 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 border-2 ${isOnline
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent shadow-md shadow-emerald-500/30 hover:opacity-90'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
          >
            <span className="relative flex h-3 w-3">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-white' : 'bg-slate-400'}`}></span>
            </span>
            {isOnline ? 'STATUS: TERHUBUNG' : 'STATUS: OFFLINE'}
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm font-bold bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition-all shadow-sm">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </PageHeaderCard>

      {/* ── KPI Cards (4 Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Menunggu"
          value={waitingTickets.length}
          footerText="Antrean tersisa"
          gradientClass="bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500"
          icon={<User className="w-4 h-4 text-white" />}
        />
        <KpiCard
          title="Total Dilayani"
          value={liveOp.totalServed}
          footerText="Antrean diselesaikan"
          gradientClass="bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500"
          icon={<CheckCircle2 className="w-4 h-4 text-white" />}
        />
        <KpiCard
          title="Dilewati"
          value={liveOp.totalSkipped}
          footerText="Antrean dilewati"
          gradientClass="bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500"
          icon={<XCircle className="w-4 h-4 text-white" />}
        />
        <KpiCard
          title="Rata-rata Waktu"
          value={avgSeconds > 0 ? (avgSeconds < 60 ? `${avgSeconds}d` : `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}d`) : '—'}
          footerText="Per pelayanan"
          gradientClass="bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600"
          icon={<Clock className="w-4 h-4 text-white" />}
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Kiri: Antrean Aktif ── */}
        <div className="lg:col-span-1 h-full">

          <div className={`bg-white backdrop-blur-xl border-slate-200 rounded-2xl border-2 h-full min-h-[380px] flex flex-col overflow-hidden transition-all duration-300 ${currentTicket ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-slate-200 shadow-sm'}`}>
            <div className="p-4 border-b border-white/40 bg-white/40 text-center">
              <h2 className="font-bold text-slate-600 text-sm tracking-wider uppercase">Antrean Saat Ini</h2>
            </div>

            <div className="p-6 text-center flex-1 flex flex-col justify-center">
              {currentTicket ? (
                <div className={`space-y-4 ${recallAnim ? 'animate-pulse' : ''}`}>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500 text-white shadow-sm font-bold text-xs uppercase tracking-widest mb-2">
                    {currentTicket.status === 'calling' ? 'Sedang Diproses' : 'Dalam Pelayanan'}
                  </div>

                  <div className="text-6xl md:text-7xl font-black text-primary tracking-tighter truncate px-4">
                    {currentTicket.displayNumber}
                  </div>

                  <div className="flex justify-center gap-2">
                    <Badge className={`font-bold text-xs ${currentTicket.type === 'priority' ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' :
                        currentTicket.type === 'online' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' :
                          'bg-slate-500 hover:bg-slate-600 text-white border-0 shadow-sm'
                      }`}>
                      {currentTicket.type === 'priority' ? 'PRIORITAS' : currentTicket.type === 'online' ? 'ONLINE' : 'OFFLINE'}
                    </Badge>

                  </div>

                  <div className="pt-4 border-t border-slate-100 text-slate-500 font-medium">
                    <p className="text-lg text-slate-800 font-bold">
                      {currentTicket.customerName || (currentTicket.type === 'priority' ? 'Pelanggan Prioritas' : 'Pelanggan Umum')}
                    </p>
                    <p className="text-xs font-bold text-primary mt-1 uppercase tracking-wider">
                      {SERVICES.find((s) => s.code === currentTicket.serviceCode)?.name}
                    </p>
                    {currentTicket.purpose && <p className="text-xs mt-1">{currentTicket.purpose}</p>}
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center gap-4 text-slate-400 -mt-8">
                  <div className="w-20 h-20 rounded-full bg-transparent flex items-center justify-center text-4xl animate-zoom-in-out">
                    😴
                  </div>
                  <div>
                    <p className="font-bold text-slate-600">
                      {waitingTickets.length > 0 ? `Ada ${waitingTickets.length} Antrean saat ini` : 'Belum Ada Antrean'}
                    </p>
                    <p className="text-xs mt-1">
                      {waitingTickets.length > 0 ? 'Silakan tekan tombol Panggil pada daftar antrean.' : 'Harap menunggu admin memberikan antrean ke loket Anda.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {currentTicket && (
              <div className="grid grid-cols-3 gap-1 p-2 bg-slate-50">
                <button
                  onClick={handleRecall}
                  className="flex flex-col items-center justify-center py-3 gap-1 rounded-xl font-bold text-xs text-slate-600 hover:bg-white hover:shadow-sm hover:text-primary transition-all"
                >
                  <RefreshCw size={24} className="mb-1" />
                  Panggil Ulang
                </button>
                <button
                  onClick={async () => { await skipTicket(liveOp.id); }}
                  className="flex flex-col items-center justify-center py-3 gap-1 rounded-xl font-bold text-xs text-rose-600 hover:bg-white hover:shadow-sm hover:text-rose-700 transition-all"
                >
                  <SkipForward size={24} className="mb-1" />
                  Lewati
                </button>
                <button
                  onClick={async () => { await completeTicket(liveOp.id); }}
                  className="flex flex-col items-center justify-center py-3 gap-1 rounded-xl font-bold text-xs text-emerald-600 hover:bg-white hover:shadow-sm hover:text-emerald-700 transition-all"
                >
                  <Check size={24} className="mb-1" />
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Kanan: Tabel Riwayat & Stats ── */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border-2 flex items-center gap-3 font-bold text-sm backdrop-blur-md shadow-sm ${liveOp.status === 'available' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700'
              : liveOp.status === 'busy' ? 'bg-amber-500/20 border-amber-500/30 text-amber-800'
                : 'bg-slate-500/10 border-slate-200 text-slate-500'
            }`}>
            <span className="relative flex h-3 w-3">
              {(liveOp.status === 'available' || liveOp.status === 'busy') && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveOp.status === 'available' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${liveOp.status === 'available' ? 'bg-emerald-600' : liveOp.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
            </span>
            {liveOp.status === 'available' ? 'Status: Menunggu Antrean'
              : liveOp.status === 'busy' ? 'Status: Sedang Melayani'
                : 'Status: Offline'}
          </div>

          {/* ── Antrean Menunggu ── */}
          <div className="bg-white backdrop-blur-xl rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/40 bg-white/40 flex items-center justify-between">
              <h2 className="font-bold text-slate-600 text-sm tracking-wider uppercase">Menunggu Panggilan</h2>
              <span className="bg-emerald-500 text-white font-bold text-xs h-6 w-6 flex items-center justify-center rounded-full shadow-sm">
                {waitingTickets.length}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-3 h-[290px] shrink-0 overflow-y-auto custom-scrollbar">
              {waitingTickets.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <p className="font-bold text-sm">Kosong</p>
                  <p className="text-xs mt-1">Tidak ada tiket yang menunggu dipanggil.</p>
                </div>
              ) : (
                waitingTickets.map(t => (
                  <div key={t.id} className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex items-stretch overflow-hidden">
                    {/* Color Strip */}
                    <div className={`w-1.5 shrink-0 ${t.type === 'priority' ? 'bg-amber-500' :
                        t.type === 'online' ? 'bg-emerald-500' :
                          'bg-slate-400'
                      }`} />

                    <div className="p-3.5 flex-1 flex items-center justify-between gap-3 bg-gradient-to-r from-white to-slate-50/50">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-700 text-lg leading-none tracking-tight">{t.displayNumber}</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${t.type === 'priority' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              t.type === 'online' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                            {t.type === 'priority' ? 'Prioritas' : t.type}
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            {SERVICES.find(s => s.code === t.serviceCode)?.name}
                          </span>
                          {t.customerName && (
                            <span className="text-[11px] font-bold text-primary mt-0.5">{t.customerName}</span>
                          )}
                        </div>
                      </div>

                      <CustomButton
                        variant="primary"
                        disabled={liveOp.status === 'busy'}
                        onClick={async () => { await callAssignedTicket(liveOp.id, t.id); }}
                        className="px-4 py-2 h-auto text-xs shrink-0 shadow-sm"
                      >
                        Panggil
                      </CustomButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Table Section ── */}
      <div className="bg-white backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-4 border-b border-white/40 flex flex-row items-center justify-between bg-white/40 border-white/40 gap-3">
          <div className="flex items-center space-x-2 truncate">
            <h2 className="font-bold text-slate-800 text-lg">Riwayat Pelayanan Loket {liveOp.loket}</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">({servedToday.length} Antrean)</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-bold border border-white/40 text-center w-28">WAKTU</th>
                <th className="px-4 py-3 font-bold border border-white/40 text-center w-28">TIKET</th>
                <th className="px-4 py-3 font-bold border border-white/40 text-center">TIPE PELANGGAN</th>
                <th className="px-4 py-3 font-bold border border-white/40">LAYANAN</th>
                <th className="px-4 py-3 font-bold border border-white/40 text-center">DURASI</th>
                <th className="px-4 py-3 font-bold border border-white/40 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {servedToday.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 border-b border-slate-200">
                    <p className="font-bold text-base text-slate-600 mb-1">Belum ada riwayat</p>
                    <p className="text-xs">Anda belum melayani pelanggan hari ini.</p>
                  </td>
                </tr>
              ) : (
                servedToday.slice().reverse().map((t) => {
                  const time = new Date(t.takenAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  const dur = t.doneAt && t.calledAt
                    ? Math.round((t.doneAt - t.calledAt) / 1000)
                    : null;
                  const sc = STATUS_LABEL[t.status] ?? { label: t.status, variant: 'slate' as BadgeVariant };

                  return (
                    <tr key={t.id} className="transition-colors hover:bg-white">
                      <td className="px-4 py-3 border border-white/40 text-center text-sm font-semibold text-slate-600">
                        {time}
                      </td>
                      <td className="px-4 py-3 border border-white/40 text-center">
                        <span className="font-black text-lg text-primary">{t.displayNumber}</span>
                      </td>
                      <td className="px-4 py-3 border border-white/40 text-center">
                        <Badge className={`text-xs h-6 px-2.5 font-bold text-white border-0 shadow-sm ${t.type === 'priority' ? 'bg-amber-500 hover:bg-amber-600' :
                            t.type === 'online' ? 'bg-emerald-500 hover:bg-emerald-600' :
                              'bg-slate-600 hover:bg-slate-700'
                          }`}>
                          {t.type === 'priority' ? 'PRIORITAS' : t.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 border border-white/40 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          {SERVICES.find(s => s.code === t.serviceCode)?.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 border border-white/40 text-center text-sm font-medium text-slate-600">
                        {dur !== null ? (dur < 60 ? `${dur}d` : `${Math.floor(dur / 60)}m ${dur % 60}d`) : '-'}
                      </td>
                      <td className="px-4 py-3 border border-white/40 text-center">
                        <CustomStatusBadge variant={sc.variant} label={sc.label} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function OperatorPage() {
  const { registerOperator, state } = useQueue();
  const [operator, setOperator] = useState<OperatorSession | null>(() => {
    try {
      const s = sessionStorage.getItem('operator_v2');
      if (!s) return null;
      return JSON.parse(s) as OperatorSession;
    } catch { return null; }
  });

  useEffect(() => {
    if (!operator) return;
    const live = state.operators.find((o) => o.id === operator.id);
    if (live) setOperator(live);
  }, [state.operators]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (name: string, loket: number, services: ServiceCode[]) => {
    try {
      const op = await registerOperator(name, loket, services);
      setOperator(op);
      sessionStorage.setItem('operator_v2', JSON.stringify(op));
    } catch (err) {
      console.error('[OperatorPage] Login gagal:', err);
      alert('Gagal masuk sebagai operator. Coba lagi.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('operator_v2');
    setOperator(null);
  };

  if (!operator) return <OperatorLoginForm onLogin={handleLogin} />;
  return <OperatorDashboard operator={operator} onLogout={handleLogout} />;
}
