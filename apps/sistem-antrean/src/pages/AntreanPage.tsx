import { useState } from 'react';
import { useQueue } from '../hooks/useQueue';
import type { ServiceCode } from '../types/queue';
import {
  Badge,
  Select, SelectContent, SelectItem, SelectTrigger
} from '@elproject/ui';
import { CustomButton } from '../components/CustomButton';
import { CustomSelect } from '../components/CustomSelect';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { KpiCard } from '../components/KpiCard';
import { CustomNotification } from '../components/CustomNotification';
import { CustomStatusBadge, type BadgeVariant } from '../components/CustomStatusBadge';
import { Plus, Search, Monitor, CheckCircle2, ListChecks, Activity, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';

export function AntreanPage() {
  const {
    state,
    addOfflineTicket,
    checkInOnlineTicket,
    assignTicketToOperator
  } = useQueue();

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'offline' | 'online'>('offline');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoketCards, setShowLoketCards] = useState(false);

  // Offline form state
  const [serviceCode, setServiceCode] = useState<string>('none');
  const [selectedOperator, setSelectedOperator] = useState<string>('none');
  const [customerType, setCustomerType] = useState<'offline' | 'online' | 'priority' | 'none'>('none');

  // Online form state
  const [checkInCode, setCheckInCode] = useState('');

  // Feedback
  const [showSuccess, setShowSuccess] = useState('');
  const [showError, setShowError] = useState('');

  // KPI Calculations
  const waitingTickets = state.tickets.filter((t) => t.status === 'waiting' || t.status === 'calling');
  const pendingCheckinTickets = state.tickets.filter((t) => t.status === 'pending_checkin');
  const doneTickets = state.tickets.filter((t) => t.status === 'done');
  const totalToday = state.tickets.filter((t) => t.status !== 'pending_checkin').length;
  const onlineTickets = state.tickets.filter((t) => t.type === 'online').length;

  const onlineOps = state.operators.filter((o) => o.status !== 'offline');
  const availableOps = state.operators.filter((o) => o.status === 'available');
  const busyOps = state.operators.filter((o) => o.status === 'busy');

  const handleAddOffline = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceCode || serviceCode === 'none') {
      setShowError('❌ Silakan pilih layanan terlebih dahulu!');
      setTimeout(() => setShowError(''), 3000);
      return;
    }
    if (!selectedOperator || selectedOperator === 'none') {
      setShowError('❌ Silakan pilih operator terlebih dahulu!');
      setTimeout(() => setShowError(''), 3000);
      return;
    }

    try {
      const t = await addOfflineTicket(serviceCode as ServiceCode, undefined, customerType as 'offline' | 'online' | 'priority');
      await assignTicketToOperator(t.id, selectedOperator);

      setShowSuccess(`✅ Nomor ${t.displayNumber} berhasil dikirim ke operator!`);
      setSelectedOperator('none');
      setTimeout(() => setShowSuccess(''), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambah antrean.';
      setShowError(`❌ ${msg}`);
      setTimeout(() => setShowError(''), 4000);
    }
    // don't close form, they might add another
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInCode.trim()) return;
    const t = await checkInOnlineTicket(checkInCode.trim().toUpperCase());
    if (t) {
      setCheckInCode('');
      setShowSuccess(`✅ Check-in berhasil! ${t.displayNumber} — ${t.customerName} masuk ke antrean.`);
      setTimeout(() => setShowSuccess(''), 3000);
    } else {
      setShowError('❌ Kode tidak valid atau sudah digunakan.');
      setTimeout(() => setShowError(''), 3000);
    }
  };

  const handleAssign = async (ticketId: string, operatorId: string) => {
    await assignTicketToOperator(ticketId, operatorId);
    setShowSuccess('✅ Tiket berhasil ditugaskan ke loket!');
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const allTickets = state.tickets;
  const filteredTickets = allTickets.filter(t => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      t.displayNumber.toLowerCase().includes(search) ||
      (t.customerName || '').toLowerCase().includes(search) ||
      (t.operatorName || '').toLowerCase().includes(search) ||
      t.status.toLowerCase().includes(search);
    return matchesSearch;
  }).sort((a, b) => b.takenAt - a.takenAt); // newest first

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 md:p-8">
      {/* ── Header ── */}
      <PageHeaderCard title="Daftar Antrean" subtitle="Atur dan kelola tiket antrean secara realtime" showProfile={false}>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 mr-2">
          <div className="relative w-full sm:w-64 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Cari nomor, nama, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-4 pl-10 text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm font-medium text-sm h-[44px]"
            />
          </div>

          <CustomButton
            variant={showForm ? 'slate' : 'primary'}
            onClick={() => {
              setShowForm(!showForm);
              setShowSuccess('');
              setShowError('');
            }}
            className="w-full sm:w-auto"
          >
            {showForm ? 'Tutup Form' : <><Plus size={18} /> <span>Tambah Antrean</span></>}
          </CustomButton>
        </div>
      </PageHeaderCard>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
        <KpiCard
          title="Total Hari Ini"
          value={totalToday}
          footerText="Nomor diterbitkan"
          gradientClass="bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600"
          titleColorClass="text-blue-100"
          icon={<Activity className="w-4 h-4 text-white" />}
        />

        <KpiCard
          title="Menunggu"
          value={waitingTickets.length}
          footerText={`${pendingCheckinTickets.length} belum check-in`}
          gradientClass="bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500"
          titleColorClass="text-purple-100"
          icon={<Clock className="w-4 h-4 text-white" />}
        />

        <KpiCard
          title="Selesai Dilayani"
          value={doneTickets.length}
          footerText={`${onlineTickets} via online`}
          gradientClass="bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500"
          titleColorClass="text-emerald-100"
          icon={<CheckCircle2 className="w-4 h-4 text-white" />}
        />

        <KpiCard
          title="Operator Aktif"
          value={onlineOps.length}
          footerText={`${busyOps.length} sibuk · ${availableOps.length} tersedia`}
          gradientClass="bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500"
          titleColorClass="text-amber-100"
          icon={<Users className="w-4 h-4 text-white" />}
        />
      </div>

      {showSuccess && (
        <CustomNotification type="success" message={showSuccess} />
      )}

      {showError && (
        <CustomNotification type="error" message={showError} />
      )}

      {/* ── Form Tambah Antrean ── */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex gap-4 mb-6 border-b border-slate-100 pb-3">
            <button
              onClick={() => setFormType('offline')}
              className={`font-bold text-sm sm:text-base flex items-center gap-2 px-2 pb-2 -mb-[13px] border-b-2 transition-colors ${formType === 'offline' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              Antrean Manual
            </button>
            <button
              onClick={() => setFormType('online')}
              className={`font-bold text-sm sm:text-base flex items-center gap-2 px-2 pb-2 -mb-[13px] border-b-2 transition-colors ${formType === 'online' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              Check-In Online
            </button>
          </div>

          {formType === 'offline' ? (
            <form onSubmit={handleAddOffline} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_16.66%] gap-4">
              <CustomSelect
                label="Tipe Pelanggan"
                required
                placeholder="Belum dipilih"
                value={customerType}
                onValueChange={(val) => setCustomerType(val as 'offline' | 'online' | 'priority' | 'none')}
                options={[
                  { value: 'none', label: <span className="text-slate-500">Belum dipilih</span> },
                  { value: 'offline', label: <span className="font-medium text-slate-700">Offline</span> },
                  { value: 'online', label: <span className="font-medium text-slate-700">Online</span> },
                  { value: 'priority', label: <span className="font-bold text-amber-600">Prioritas</span> },
                ]}
              />
              <CustomSelect
                label="Pilih Layanan"
                required
                value={serviceCode}
                onValueChange={setServiceCode}
                placeholder="Belum dipilih"
                options={[
                  { value: 'none', label: <span className="text-slate-500">Belum dipilih</span> },
                  ...state.services.map(s => ({
                    value: s.code,
                    label: <span className="flex items-center gap-2 font-medium">{s.name} ({s.code})</span>
                  }))
                ]}
              />
              <CustomSelect
                label="Pilih Operator"
                required
                value={selectedOperator}
                onValueChange={setSelectedOperator}
                placeholder="Belum dipilih"
                options={[
                  { value: 'none', label: <span className="text-slate-500">Belum dipilih</span> },
                  ...onlineOps.map(op => ({
                    value: op.id,
                    label: (
                      <div className="flex justify-between items-center w-full min-w-[200px]">
                        <span className="font-bold text-slate-700">{op.name}</span>
                        <span className="text-slate-400 text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full ml-4">
                          Loket {op.loket}
                        </span>
                      </div>
                    )
                  }))
                ]}
              />
              <div className="flex flex-col justify-end gap-1.5">
                <label className="text-sm font-bold opacity-0 select-none pointer-events-none" aria-hidden="true">Aksi</label>
                <CustomButton
                  type="submit"
                  variant="primary"
                  className="w-full h-[44px]"
                >
                  Kirim
                </CustomButton>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCheckIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col justify-end gap-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Kode Booking <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Misal: X9K2LM"
                  value={checkInCode}
                  onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
                  className="w-full h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono uppercase tracking-widest focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  required
                />
              </div>
              <div className="flex flex-col justify-end gap-1.5">
                <label className="text-sm font-bold opacity-0 select-none pointer-events-none" aria-hidden="true">Aksi</label>
                <CustomButton
                  type="submit"
                  variant="success"
                  className="w-full h-[44px]"
                >
                  <CheckCircle2 size={16} /> Validasi Online
                </CustomButton>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Loket Status ── */}
      {showLoketCards && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {[1, 2, 3, 4, 5].map(loket => {
            const op = state.operators.find(o => o.loket === loket && o.status !== 'offline');

            let statusText = 'Tutup';
            let statusColor = 'text-slate-200';
            let dotColor = 'bg-slate-300';
            let cardStyle = 'bg-gradient-to-br from-slate-500 to-slate-600 border-slate-700 opacity-80';

            if (op) {
              if (op.status === 'busy') {
                statusText = 'Sedang Melayani';
                statusColor = 'text-orange-100';
                dotColor = 'bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]';
                cardStyle = 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600 shadow-md shadow-orange-600/30';
              } else {
                statusText = 'Kosong';
                statusColor = 'text-emerald-100';
                dotColor = 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]';
                cardStyle = 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 shadow-md shadow-emerald-600/30';
              }
            }

            return (
              <div key={loket} className={`rounded-xl border p-3.5 flex flex-col justify-between text-left ${cardStyle} text-white transition-all`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="font-black tracking-wider text-xs text-white/90 uppercase drop-shadow-sm">LOKET {loket}</span>
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                </div>

                <div className="flex flex-col w-full">
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${statusColor} drop-shadow-sm mb-0.5`}>{statusText}</span>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[13px] text-white font-bold truncate pr-2">{op ? op.name : '-'}</span>
                    {op && (
                      <span className="text-[10px] font-bold text-white bg-orange-500/80 backdrop-blur-sm shadow-sm px-2 py-0.5 rounded shrink-0 border border-orange-400/50" title="Total antrean menunggu di loket ini">
                        {state.tickets.filter(t => t.status === 'waiting' && t.operatorId === op.id).length} Antrean
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Table Section ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-row items-center justify-between bg-white gap-3">
          <div className="flex items-center space-x-2 truncate">
            <ListChecks size={20} className="text-slate-600 shrink-0" />
            <h2 className="font-bold text-slate-800 text-lg">Semua Data Antrean ({filteredTickets.length})</h2>
          </div>
          <button
            onClick={() => setShowLoketCards(!showLoketCards)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors border border-slate-200 shadow-sm shrink-0"
            title={showLoketCards ? 'Sembunyikan Status Loket' : 'Tampilkan Status Loket'}
          >
            {showLoketCards ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-bold border border-slate-200 w-12 text-center">NO</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">WAKTU</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">TIKET</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center">TIPE PELANGGAN</th>
                <th className="px-4 py-3 font-bold border border-slate-200">LAYANAN</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-48">TUJUAN</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 border border-slate-200">
                    <p className="font-bold text-lg text-slate-600 mb-1">Tidak ada data</p>
                    <p className="text-sm">Antrean kosong atau tidak ditemukan dalam pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, index) => {
                  const service = state.services.find(s => s.code === ticket.serviceCode);
                  const time = new Date(ticket.takenAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                  // Status config
                  const statusMap: Record<string, { label: string, variant: BadgeVariant }> = {
                    waiting: { label: 'Menunggu', variant: 'slate' },
                    calling: { label: 'Diproses', variant: 'warning' },
                    serving: { label: 'Dilayani', variant: 'info' },
                    done: { label: 'Selesai', variant: 'success' },
                    skipped: { label: 'Dilewati', variant: 'error' },
                    pending_checkin: { label: 'Pending', variant: 'purple' },
                  };
                  const st = statusMap[ticket.status] || statusMap.waiting;

                  return (
                    <tr key={ticket.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 border border-slate-200 text-center text-sm font-medium text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center text-sm font-semibold text-slate-600">
                        {time}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <span className="font-black text-lg text-primary">{ticket.displayNumber}</span>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <Badge className={`text-xs h-6 px-2.5 font-bold text-white border-0 shadow-sm ${ticket.type === 'priority' ? 'bg-amber-500 hover:bg-amber-600' :
                          ticket.type === 'online' ? 'bg-emerald-500 hover:bg-emerald-600' :
                            'bg-slate-600 hover:bg-slate-700'
                          }`}>
                          {ticket.type === 'priority' ? 'PRIORITAS' : ticket.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          {service?.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        {ticket.status === 'waiting' && !ticket.operatorId ? (
                          onlineOps.length > 0 ? (
                            <div className="relative inline-block w-full text-left">
                              <Select onValueChange={(val) => handleAssign(ticket.id, val)}>
                                <SelectTrigger className="h-8 text-xs font-bold bg-primary text-primary-foreground border-0 hover:bg-primary/90 rounded-lg shadow-sm">
                                  <div className="flex w-full items-center justify-center gap-1.5">
                                    <Monitor size={12} /> Tugaskan Loket
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white shadow-md border-slate-200 rounded-xl">
                                  {onlineOps.map(op => (
                                    <SelectItem key={op.id} value={op.id} className="text-xs font-bold cursor-pointer hover:bg-slate-50">
                                      Loket {op.loket} - {op.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">Semua Loket Offline</span>
                          )
                        ) : (
                          <span className="text-sm font-medium text-slate-700">
                            {ticket.assignedLoket ? `Loket ${ticket.assignedLoket}` : 'Menunggu'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <CustomStatusBadge variant={st.variant} label={st.label} />
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
