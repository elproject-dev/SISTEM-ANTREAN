import { useState } from 'react';
import { useQueue } from '../hooks/useQueue';
import { SERVICES } from '../types/queue';
import {
  Badge,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@elproject/ui';
import { Download, Search, ListChecks } from 'lucide-react';
import { CustomStatusBadge, type BadgeVariant } from '../components/CustomStatusBadge';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { CustomButton } from '../components/CustomButton';
import { KpiCard } from '../components/KpiCard';
import { Users, CheckCircle, XCircle, Globe } from 'lucide-react';

const STATUS_LABEL: Record<string, { label: string; variant: BadgeVariant }> = {
  waiting: { label: 'Menunggu', variant: 'slate' },
  calling: { label: 'Diproses', variant: 'warning' },
  serving: { label: 'Dilayani', variant: 'info' },
  done: { label: 'Selesai', variant: 'success' },
  skipped: { label: 'Dilewati', variant: 'error' },
  pending_checkin: { label: 'Pending', variant: 'purple' },
};

export function HistoryPage() {
  const { state } = useQueue();
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const tickets = state.tickets
    .filter((t) => {
      const matchSearch = !search || t.displayNumber.toLowerCase().includes(search.toLowerCase())
        || t.customerName?.toLowerCase().includes(search.toLowerCase())
        || t.bookingCode?.toLowerCase().includes(search.toLowerCase());
      const matchService = serviceFilter === 'all' || t.serviceCode === serviceFilter;
      const matchType = typeFilter === 'all' || t.type === typeFilter;
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchService && matchType && matchStatus;
    })
    .sort((a, b) => b.takenAt - a.takenAt);

  const doneCount = state.tickets.filter((t) => t.status === 'done').length;
  const skippedCount = state.tickets.filter((t) => t.status === 'skipped').length;
  const onlineCount = state.tickets.filter((t) => t.type === 'online').length;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 md:p-8">
      {/* ── Header ── */}
      <PageHeaderCard title="Riwayat Antrean" subtitle="Semua antrean hari ini" showProfile={false}>
        <CustomButton variant="slate" className="gap-2">
          <Download size={18} /> Ekspor
        </CustomButton>
      </PageHeaderCard>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Antrean"
          value={state.tickets.length}
          icon={<Users size={18} className="text-white" />}
          gradientClass="bg-gradient-to-br from-slate-700 to-slate-800"
        />
        <KpiCard
          title="Selesai"
          value={doneCount}
          icon={<CheckCircle size={18} className="text-white" />}
          gradientClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <KpiCard
          title="Dilewati"
          value={skippedCount}
          icon={<XCircle size={18} className="text-white" />}
          gradientClass="bg-gradient-to-br from-rose-500 to-rose-600"
        />
        <KpiCard
          title="Via Online"
          value={onlineCount}
          icon={<Globe size={18} className="text-white" />}
          gradientClass="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* ── Table Section ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center space-x-2 truncate">
            <ListChecks size={20} className="text-slate-600 shrink-0" />
            <h2 className="font-bold text-slate-800 text-lg">Semua Data Antrean ({tickets.length})</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Cari nomor, nama, kode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-4 pl-10 text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm font-medium text-sm h-[44px]"
              />
            </div>
            
            <CustomButton
              variant={showFilters ? 'primary' : 'slate'}
              onClick={() => setShowFilters(!showFilters)}
              className="h-[44px] px-4"
            >
              Filter
            </CustomButton>
          </div>
        </div>
        
        {showFilters && (
          <div className="px-4 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="w-full sm:w-64">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Berdasarkan Layanan</label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full h-[40px] bg-white border-slate-200 text-sm rounded-xl font-medium shadow-sm focus:ring-4 focus:ring-primary/10">
                  <SelectValue placeholder="Semua Layanan" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md border-slate-200 rounded-xl">
                  <SelectItem value="all" className="text-sm font-medium cursor-pointer hover:bg-slate-50">Semua Layanan</SelectItem>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.code} value={s.code} className="text-sm font-medium cursor-pointer hover:bg-slate-50">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Tipe Pelanggan</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full h-[40px] bg-white border-slate-200 text-sm rounded-xl font-medium shadow-sm focus:ring-4 focus:ring-primary/10">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md border-slate-200 rounded-xl">
                  <SelectItem value="all" className="text-sm font-medium cursor-pointer hover:bg-slate-50">Semua Tipe</SelectItem>
                  <SelectItem value="offline" className="text-sm font-medium cursor-pointer hover:bg-slate-50">Offline</SelectItem>
                  <SelectItem value="online" className="text-sm font-medium cursor-pointer hover:bg-slate-50">Online</SelectItem>
                  <SelectItem value="priority" className="text-sm font-medium cursor-pointer hover:bg-slate-50">Prioritas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Status Antrean</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-[40px] bg-white border-slate-200 text-sm rounded-xl font-medium shadow-sm focus:ring-4 focus:ring-primary/10">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md border-slate-200 rounded-xl">
                  <SelectItem value="all" className="text-sm font-medium cursor-pointer hover:bg-slate-50">Semua Status</SelectItem>
                  {Object.entries(STATUS_LABEL).map(([key, item]) => (
                    <SelectItem key={key} value={key} className="text-sm font-medium cursor-pointer hover:bg-slate-50">{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-bold border border-slate-200 w-12 text-center">NO</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">WAKTU</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">TIKET</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center">TIPE PELANGGAN</th>
                <th className="px-4 py-3 font-bold border border-slate-200">LAYANAN</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center">OPERATOR</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">DURASI</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-36">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 border border-slate-200">
                    <p className="font-bold text-lg text-slate-600 mb-1">Tidak ada data</p>
                    <p className="text-sm">Antrean kosong atau tidak ditemukan dalam pencarian.</p>
                  </td>
                </tr>
              ) : (
                tickets.slice(0, 100).map((t, index) => {
                  const service = SERVICES.find(s => s.code === t.serviceCode);
                  const time = new Date(t.takenAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  const dur = t.doneAt && t.calledAt
                      ? Math.round((t.doneAt - t.calledAt) / 1000)
                      : null;
                  const sc = STATUS_LABEL[t.status] ?? { label: t.status, variant: 'slate' as BadgeVariant };
                  
                  return (
                    <tr key={t.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 border border-slate-200 text-center text-sm font-medium text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center text-sm font-semibold text-slate-600">
                        {time}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <span className="font-black text-lg text-primary">{t.displayNumber}</span>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <Badge className={`text-xs h-6 px-2.5 font-bold text-white border-0 shadow-sm ${
                          t.type === 'priority' ? 'bg-amber-500 hover:bg-amber-600' :
                          t.type === 'online' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                          'bg-slate-600 hover:bg-slate-700'
                        }`}>
                          {t.type === 'priority' ? 'PRIORITAS' : t.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-sm font-medium text-slate-700">
                        {service?.name}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center text-sm font-bold text-slate-600">
                        {t.operatorName ? (
                          <>
                            {t.operatorName} <br/> <span className="text-[10px] font-semibold text-slate-400">Loket {t.assignedLoket}</span>
                          </>
                        ) : 'Menunggu'}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center text-sm font-medium text-slate-600">
                        {dur !== null ? (dur < 60 ? `${dur}d` : `${Math.floor(dur / 60)}m ${dur % 60}d`) : '-'}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <CustomStatusBadge variant={sc.variant} label={sc.label} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          {tickets.length > 100 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
              <p className="text-xs font-medium text-slate-500">Menampilkan 100 dari {tickets.length} entri</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
