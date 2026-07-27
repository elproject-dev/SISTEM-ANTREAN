import { useState } from 'react';
import { useQueue } from '../hooks/useQueue';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { KpiCard } from '../components/KpiCard';

import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Progress,
} from '@elproject/ui';
import {
  Users, Clock, CheckCircle2, AlertCircle,
  Activity, RefreshCw, ArrowUpRight, BarChart3,
  History, Monitor
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

// ─── Activity Feed Item ────────────────────────────────────────────────────────
function ActivityItem({ ticket, isNew, services }: { ticket: import('../types/queue').QueueTicket; isNew?: boolean; services: import('../types/queue').ServiceType[] }) {
  const service = services.find((s) => s.code === ticket.serviceCode);
  const statusMap = {
    waiting: { label: 'Menunggu', color: 'text-muted-foreground', bg: 'bg-slate-100' },
    calling: { label: 'Diproses', color: 'text-amber-600', bg: 'bg-amber-50 border border-amber-200' },
    serving: { label: 'Dilayani', color: 'text-blue-600', bg: 'bg-blue-50 border border-blue-200' },
    done: { label: 'Selesai', color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-200' },
    skipped: { label: 'Dilewati', color: 'text-red-500', bg: 'bg-red-50 border border-red-200' },
    pending_checkin: { label: 'Pending', color: 'text-purple-600', bg: 'bg-purple-50 border border-purple-200' },
  };
  const cfg = statusMap[ticket.status] ?? statusMap.waiting;
  const time = new Date(ticket.takenAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isNew ? 'bg-primary/5 border border-primary/20' : 'hover:bg-slate-50 border border-transparent'}`}>
      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-base flex-shrink-0 text-slate-600 shadow-sm border border-slate-200">
        <span className="font-bold">{service?.code || '#'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-800">{ticket.displayNumber}</span>
          <Badge variant={ticket.type === 'online' ? 'default' : 'outline'} className="text-[10px] py-0 px-1.5 h-4 font-semibold">
            {ticket.type === 'online' ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 truncate">
          {ticket.customerName ?? service?.name}
          {ticket.operatorName && ` → ${ticket.operatorName}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
        <span className="text-[10px] font-medium text-slate-400">{time}</span>
      </div>
    </div>
  );
}

// ─── Service Breakdown (Horizontal Bars) ─────────────────────────────────────────
function ServiceBreakdown({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-4">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col gap-1.5 group">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{d.label}</span>
            <span className="font-bold text-slate-500">{d.value} <span className="font-normal text-xs ml-0.5">org</span></span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Operator Status Card ──────────────────────────────────────────────────────
function OperatorStatusRow({ operator }: { operator: import('../types/queue').OperatorSession }) {
  const { state } = useQueue();
  const ct = operator.currentTicketId ? state.tickets.find((t) => t.id === operator.currentTicketId) : null;

  const statusCfg = {
    available: { dot: 'bg-emerald-500', label: 'Tersedia' },
    busy: { dot: 'bg-amber-500 animate-pulse', label: 'Sibuk' },
    offline: { dot: 'bg-slate-300', label: 'Offline' },
  }[operator.status];

  const utilRate = operator.totalServed > 0
    ? Math.min(100, Math.round(((operator.totalServed) / Math.max(operator.totalServed + 1, 10)) * 100))
    : 0;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-700 shadow-inner">
          {operator.name.charAt(0).toUpperCase()}
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${statusCfg.dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-slate-800 truncate">{operator.name}</p>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">Loket {operator.loket}</span>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={utilRate} className="h-1.5 flex-1" />
          <span className="text-[10px] font-bold text-slate-500 flex-shrink-0 w-12 text-right">
            {operator.totalServed} slsi
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 text-right min-w-[3rem]">
        {ct ? (
          <span className="text-sm font-black text-primary">{ct.displayNumber}</span>
        ) : (
          <span className={`text-[10px] font-bold uppercase tracking-wider ${operator.status === 'available' ? 'text-emerald-600' : 'text-slate-400'}`}>
            {statusCfg.label}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export function DashboardPage() {
  const { state, waitingTickets, pendingCheckinTickets, doneTickets } = useQueue();
  const [now] = useState(new Date());

  const onlineOps = state.operators.filter((o) => o.status !== 'offline');
  const availableOps = state.operators.filter((o) => o.status === 'available');
  const busyOps = state.operators.filter((o) => o.status === 'busy');

  const totalToday = state.tickets.filter((t) => t.status !== 'pending_checkin').length;
  const onlineTickets = state.tickets.filter((t) => t.type === 'online').length;

  const serviceStats = state.services.map((s) => ({
    ...s,
    value: waitingTickets.filter((t) => t.serviceCode === s.code).length,
  }));

  const recentTickets = state.tickets
    .filter((t) => t.status !== 'pending_checkin')
    .sort((a, b) => b.takenAt - a.takenAt)
    .slice(0, 5);

  // Prepare chart data (Queue Timeline per Hour)
  const byHour: Record<number, { transactions: number }> = {};
  const startHour = Math.max(0, now.getHours() - 7);
  for (let h = startHour; h <= now.getHours(); h++) {
    byHour[h] = { transactions: 0 };
  }
  state.tickets.forEach((t) => {
    if (t.status !== 'pending_checkin') {
      const h = new Date(t.takenAt).getHours();
      if (h >= startHour && h <= now.getHours()) byHour[h].transactions += 1;
    }
  });
  const chartData = Object.entries(byHour).map(([h, v]) => {
    return {
      hourLabel: `${h}:00`,
      transactions: v.transactions
    };
  });

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-6 md:pb-8 lg:pb-6 min-h-full bg-transparent">
      {/* ── Header ── */}
      <PageHeaderCard title="Dashboard Pro" subtitle="Hai, Admin! Selamat datang kembali..." />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 items-stretch">
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

      {/* ── Revenue/Queue Chart ── */}
      <Card className="mb-6 shadow-xl shadow-slate-200/50 border-0 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-2 px-5 pt-5">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-base sm:text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <span className="hidden sm:inline">Grafik Antrean per Jam</span>
            <span className="sm:hidden">Antrean</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 mt-2">
          <div className="h-48 sm:h-52 md:h-[240px] w-full overflow-x-auto overflow-y-hidden scrollbar-slim">
            <div className="h-full pr-2 sm:pr-0" style={{ minWidth: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barCategoryGap="20%">
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="colorRevenueHover" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="hourLabel"
                    fontSize="0.6875rem"
                    tickLine={false}
                    axisLine={false}
                    stroke="#9ca3af"
                    dy={10}
                  />
                  <YAxis hide={true} />
                  <RechartsTooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white text-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 min-w-[120px] z-50">
                            <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Pukul {data.hourLabel}</p>
                            <p className="font-black text-sm text-primary tracking-wide">
                              {data.transactions} Antrean
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                  />
                  <Bar
                    dataKey="transactions"
                    fill="url(#colorRevenue)"
                    radius={[6, 6, 0, 0]}
                    barSize={48}
                    maxBarSize={64}
                    activeBar={{ fill: 'url(#colorRevenueHover)' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Bottom Section ── */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="shadow-xl shadow-slate-200/50 border-0 bg-white rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="pb-3 px-5 pt-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                Antrean per Layanan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 py-5 overflow-y-auto max-h-[350px]">
            <ServiceBreakdown data={serviceStats.map((s) => ({ label: s.name, value: s.value }))} />
          </CardContent>
        </Card>

        <Card className="shadow-xl shadow-slate-200/50 border-0 bg-white rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="pb-3 px-5 pt-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                Aktivitas Terbaru
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-slate-400 animate-spin-slow" />
            </div>
          </CardHeader>
          <CardContent className="px-5 py-5 flex-1 overflow-hidden">
            {recentTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40 py-8">
                <AlertCircle className="h-8 w-8 text-slate-400" />
                <p className="text-xs text-center font-medium text-slate-500">Belum ada aktivitas antrean hari ini</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1">
                {recentTickets.map((ticket, i) => (
                  <ActivityItem key={ticket.id} ticket={ticket} isNew={i === 0} services={state.services} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* ── Extra: Operator Status ── */}
      {onlineOps.length > 0 && (
        <Card className="shadow-xl shadow-slate-200/50 border-0 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 px-5 pt-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  Status Operator
                </CardTitle>
              </div>
              <a href="#/antrean" className="flex items-center gap-1 text-xs text-primary hover:underline font-bold">
                Kelola <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="px-5 py-5">
            <div className="flex flex-row overflow-x-auto gap-4 pb-2 scrollbar-slim">
              {onlineOps.sort((a, b) => a.loket - b.loket).map((op) => (
                <div key={op.id} className="min-w-[280px] sm:min-w-[320px] flex-shrink-0">
                  <OperatorStatusRow operator={op} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
