import re

content = """import { useEffect, useRef, useState } from 'react';
import { useQueue } from '../hooks/useQueue';
import type { QueueTicket } from '../types/queue';

// ─── Web Speech API TTS ───────────────────────────────────────────────────────
function speakText(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'id-ID';
  u.rate = 0.85;
  u.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang === 'id-ID');
  if (idVoice) u.voice = idVoice;
  window.speechSynthesis.speak(u);
}

function buildSpeechText(ticket: QueueTicket): string {
  const parts = ticket.displayNumber.split('-');
  const num = parseInt(parts[1]);
  return `Nomor antrean ${num}, ${ticket.displayNumber}, menuju loket ${ticket.assignedLoket ?? ''}. `
    + `Nomor antrean ${num}, ke loket ${ticket.assignedLoket ?? ''}.`;
}

// ─── Running ticker ───────────────────────────────────────────────────────────
function RunningTicker({ messages }: { messages: string[] }) {
  return (
    <div className="overflow-hidden whitespace-nowrap bg-slate-900/40 backdrop-blur-md border-b border-white/10 py-3 shadow-lg relative z-20">
      <div className="inline-block animate-[marquee_40s_linear_infinite]">
        {messages.map((m, i) => (
          <span key={i} className="mx-12 text-lg font-bold tracking-wide text-white">
            <span className="text-primary mr-3">✦</span> {m}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(100vw); } to { transform: translateX(-100%); } }`}</style>
    </div>
  );
}

// ─── Clock ────────────────────────────────────────────────────────────────────
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="text-right flex flex-col items-end justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 shadow-lg">
      <div className="text-3xl lg:text-4xl font-black font-mono tabular-nums text-white tracking-tight drop-shadow-md">
        {t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-xs lg:text-sm font-bold text-white/70 uppercase tracking-widest mt-1">
        {t.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
}

// ─── TV Page ──────────────────────────────────────────────────────────────────
export function TVPage() {
  const { state, waitingTickets, doneTickets } = useQueue();
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [flash, setFlash] = useState(false);
  const prevCalledRef = useRef<string | undefined>(undefined);

  const activeCalls = state.tickets
    .filter((t) => t.status === 'calling' || t.status === 'serving')
    .sort((a, b) => (b.calledAt ?? 0) - (a.calledAt ?? 0));

  const latestCall = activeCalls[0] ?? null;

  useEffect(() => {
    if (!audioUnlocked) return;
    const id = state.lastCalledTicketId;
    if (!id || id === prevCalledRef.current) return;
    prevCalledRef.current = id;
    const ticket = state.tickets.find((t) => t.id === id);
    if (ticket) {
      setFlash(true);
      setTimeout(() => setFlash(false), 2500);
      speakText(buildSpeechText(ticket));
    }
  }, [state.lastCalledTicketId, audioUnlocked]);

  const activeRunningTexts = state.runningTexts?.filter(rt => rt.isActive).map(rt => rt.text) || [];
  const tickerMessages = activeRunningTexts.length > 0 
    ? activeRunningTexts 
    : ['Selamat datang, harap menunggu nomor Anda dipanggil.'];

  return (
    <div 
      className="min-h-screen flex flex-col select-none relative overflow-hidden font-sans bg-cover bg-center bg-no-repeat bg-slate-900"
      style={{ backgroundImage: 'url(/bg_tv.png)' }}
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply z-0" />

      {/* ── TOMBOL START AUDIO ── */}
      {!audioUnlocked && (
        <button
          onClick={() => {
            setAudioUnlocked(true);
            const u = new SpeechSynthesisUtterance('');
            window.speechSynthesis.speak(u);
          }}
          className="fixed bottom-24 right-4 z-50 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:bg-orange-600 transition-all transform hover:scale-105"
        >
          🔊 Aktifkan Suara
        </button>
      )}

      {/* ── RUNNING TICKER ── */}
      <RunningTicker messages={tickerMessages} />

      {/* ── TOP BAR ── */}
      <header className="relative z-10 px-8 py-6 grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
        {[1, 2, 3, 4, 5].map((loketNumber) => {
          const op = state.operators.find((o) => o.loket === loketNumber && o.status !== 'offline');
          const ct = op?.currentTicketId ? state.tickets.find((t) => t.id === op.currentTicketId) : null;
          return (
            <div key={loketNumber} className={`flex flex-col items-center justify-center rounded-2xl border p-4 transition-all duration-500 shadow-lg ${
                op && ct ? 'bg-gradient-to-br from-primary to-orange-600 border-orange-400/50 shadow-orange-500/20 scale-105' : 
                op ? 'bg-white/10 backdrop-blur-md border-white/20' : 
                'bg-black/20 backdrop-blur-sm border-transparent opacity-50'
              }`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${op && ct ? 'text-white/80' : 'text-white/50'}`}>
                Loket {loketNumber}
              </span>
              {ct ? (
                <span className="text-4xl font-black text-white mt-1 leading-none drop-shadow-md">{ct.displayNumber}</span>
              ) : (
                <span className="text-3xl font-bold text-white/30 mt-1 leading-none">—</span>
              )}
            </div>
          );
        })}
        <div className="flex justify-end lg:pl-4">
          <LiveClock />
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 px-8 pb-8 relative z-10">
        
        {/* ── LEFT: Nomor dipanggil ── */}
        <div className="lg:col-span-8 flex flex-col justify-center items-start pl-8 lg:pl-16 relative">
          
          <div className="mb-6">
            <span className="inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-bold text-white uppercase tracking-widest border border-white/20 shadow-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_8px_rgba(249,115,22,1)]" />
              </span>
              Panggilan Saat Ini
            </span>
          </div>

          {latestCall ? (
            <div className={`flex flex-col items-start bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 pr-24 shadow-2xl transition-all duration-500 ${flash ? 'scale-105 bg-primary/20 border-primary/50 shadow-primary/30' : ''}`}>
              <div className="flex flex-col mb-4">
                <span className={`text-[12rem] lg:text-[15rem] font-black leading-none tracking-tighter drop-shadow-2xl ${flash ? 'text-white' : 'text-primary'}`}>
                  {latestCall.displayNumber}
                </span>
                <span className="text-3xl font-black tracking-widest text-white/70 uppercase ml-3 mt-2">
                  {state.services.find((s) => s.code === latestCall.serviceCode)?.name}
                </span>
              </div>

              {latestCall.assignedLoket && (
                <div className="mt-8 flex items-center gap-6 bg-gradient-to-r from-primary to-orange-500 rounded-full px-5 py-4 pr-12 shadow-xl shadow-orange-500/20 border border-orange-400/50">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-3xl font-black text-primary shadow-inner">
                    {latestCall.assignedLoket}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                      Silakan Menuju
                    </span>
                    <span className="text-3xl font-black text-white uppercase tracking-wide drop-shadow-sm">
                      Loket {latestCall.assignedLoket}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4 opacity-50 bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-12">
              <div className="text-[12rem] font-black text-white leading-none">—</div>
              <p className="text-2xl font-bold tracking-wider text-white uppercase">Menunggu Panggilan...</p>
            </div>
          )}

          {/* Previous calls */}
          {activeCalls.length > 1 && (
            <div className="mt-12 w-full max-w-3xl">
              <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">
                Panggilan Sebelumnya
              </p>
              <div className="flex gap-4">
                {activeCalls.slice(1, 4).map((t) => (
                  <div key={t.id} className="flex flex-col items-start justify-center rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md px-6 py-4 shadow-lg flex-1 hover:bg-white/20 transition-colors">
                    <span className="text-4xl font-black text-white drop-shadow-sm">{t.displayNumber}</span>
                    <span className="text-xs font-black text-primary uppercase tracking-wider mt-1">
                      Loket {t.assignedLoket}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Statistik & Daftar ── */}
        <div className="lg:col-span-4 flex flex-col gap-6 pt-4">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Menunggu', value: waitingTickets.length },
              { label: 'Selesai', value: doneTickets.length },
            ].map((s) => (
               <div key={s.label} className="flex flex-col items-center justify-center py-6 rounded-3xl bg-white/10 backdrop-blur-xl shadow-lg border border-white/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
                <span className="text-6xl font-black text-white relative z-10 drop-shadow-md">{s.value}</span>
                <span className="text-xs font-black text-white/60 uppercase tracking-widest mt-2 relative z-10">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Loket status list */}
          <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col mt-2">
            <div className="bg-white/10 backdrop-blur-md px-6 py-5 border-b border-white/10">
              <p className="text-sm font-black text-white uppercase tracking-widest text-center">
                Status Loket Pelayanan
              </p>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
              {state.operators.filter((o) => o.status !== 'offline').sort((a, b) => a.loket - b.loket).map((op) => {
                const ct = op.currentTicketId ? state.tickets.find((t) => t.id === op.currentTicketId) : null;
                return (
                  <div
                    key={op.id}
                    className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all shadow-md ${
                      op.status === 'busy' ? 'border-primary/50 bg-primary/10' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Loket {op.loket}</span>
                      <span className="text-lg font-black text-white drop-shadow-sm">{op.name}</span>
                    </div>
                    <div className="flex-1 border-b-2 border-dashed border-white/20 mx-4" />
                    {ct ? (
                      <span className="text-2xl font-black text-white bg-primary px-4 py-1.5 rounded-xl shadow-lg border border-orange-400/50">
                        {ct.displayNumber}
                      </span>
                    ) : (
                      <span className={`text-sm font-black uppercase tracking-wider ${op.status === 'available' ? 'text-white/80' : 'text-white/30'}`}>
                        {op.status === 'available' ? 'Siap' : '—'}
                      </span>
                    )}
                  </div>
                );
              })}
              {state.operators.filter((o) => o.status !== 'offline').length === 0 && (
                <div className="flex-1 flex items-center justify-center opacity-40">
                  <p className="text-sm font-bold uppercase tracking-widest text-white">Belum ada loket aktif</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER / ADMIN LINKS ── */}
      <div className="absolute bottom-0 left-0 w-full py-2 px-8 flex gap-6 text-[10px] font-black tracking-widest uppercase text-white/30 bg-black/40 backdrop-blur-md z-20">
        <a href="#/antrean" className="hover:text-primary transition-colors">Admin</a>
        <a href="#/operator" className="hover:text-primary transition-colors">Operator</a>
        <a href="#/public" className="hover:text-primary transition-colors">Publik</a>
      </div>
    </div>
  );
}
"""

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Redesign applied to TVPage.tsx")
