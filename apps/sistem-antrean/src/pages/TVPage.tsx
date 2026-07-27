import { useEffect, useRef, useState } from 'react';
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
    <div className="overflow-hidden whitespace-nowrap bg-white/40 backdrop-blur-md border-b border-white/50 py-3 shadow-lg relative z-20">
      <div className="inline-block animate-[marquee_40s_linear_infinite]">
        {messages.map((m, i) => (
          <span key={i} className="mx-12 text-xl font-black tracking-wide text-slate-900">
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
    <div className="flex flex-col items-center justify-center w-full">
      <div className="text-[2rem] font-black font-mono tabular-nums text-slate-900 tracking-tight drop-shadow-sm leading-none">
        {t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-xs font-black text-slate-800 uppercase tracking-widest mt-2 text-center leading-tight">
        {t.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
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

  // --- UI Scaling Logic ---
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const windowRatio = window.innerWidth / window.innerHeight;
      const targetRatio = 16 / 9;
      if (windowRatio < targetRatio) {
        setScale(window.innerWidth / 1920);
      } else {
        setScale(window.innerHeight / 1080);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // -------------------------

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
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden font-sans select-none">
      <div 
        className="relative bg-cover bg-center bg-no-repeat bg-slate-900 flex flex-col overflow-hidden shadow-2xl shrink-0"
        style={{ 
          width: '1920px', 
          height: '1080px', 
          transform: `scale(${scale})`, 
          transformOrigin: 'center center',
          backgroundImage: 'url(/bg_tv.png)' 
        }}
      >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[4px] z-0" />

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
      <header className="relative z-10 px-8 py-6 grid grid-cols-6 gap-6 items-stretch">
        {[1, 2, 3, 4, 5].map((loketNumber) => {
          const op = state.operators.find((o) => o.loket === loketNumber && o.status !== 'offline');
          const ct = op?.currentTicketId ? state.tickets.find((t) => t.id === op.currentTicketId) : null;
          return (
            <div key={loketNumber} className={`flex flex-col items-stretch justify-center transition-all duration-500 drop-shadow-xl h-full ${op && ct ? 'scale-105' : ''}`}>
              {/* Header Blok Loket */}
              <div className={`py-2 px-4 border border-b-0 rounded-t-3xl flex items-center justify-center text-center ${
                op && ct ? 'bg-black border-black shadow-md' : 
                op ? 'bg-black/90 border-black/90 backdrop-blur-md' : 
                'bg-black/60 border-black/60 backdrop-blur-md'
              }`}>
                <span className="text-sm font-black text-white uppercase tracking-widest">
                  Loket {loketNumber}
                </span>
              </div>
              
              {/* Blok Angka Tiket */}
              <div className={`flex-1 flex items-center justify-center border rounded-b-3xl px-4 py-6 ${
                op && ct ? 'bg-gradient-to-br from-orange-400/80 to-orange-500/80 backdrop-blur-md border-orange-400/50 shadow-inner' : 
                op ? 'bg-white/60 border-white/60 backdrop-blur-xl' : 
                'bg-white/40 border-white/40 backdrop-blur-md'
              }`}>
                {ct ? (
                  <span className={`text-6xl font-black leading-none drop-shadow-md transform -translate-y-1 ${op && ct ? 'text-white' : 'text-slate-900'}`}>{ct.displayNumber}</span>
                ) : (
                  <span className="text-5xl font-bold text-slate-800 leading-none transform -translate-y-1 drop-shadow-sm">—</span>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Clock Card */}
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl py-6 px-4">
          <LiveClock />
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-6 px-8 pb-8 relative z-10 items-stretch">
        
        {/* ── LEFT: Nomor dipanggil ── */}
        <div className="lg:col-span-4 flex flex-col justify-center items-stretch relative h-full">
          
          {latestCall ? (
            <div className={`flex flex-col items-center text-center justify-center w-full h-full rounded-[3rem] p-12 shadow-2xl transition-all duration-700 ease-out ${
              flash 
                ? 'scale-[1.02] bg-gradient-to-br from-orange-400 to-orange-500 border-4 border-white shadow-[0_0_80px_rgba(249,115,22,0.8)] animate-pulse' 
                : 'bg-white/40 backdrop-blur-xl border border-white/50'
            }`}>
              <div className="mb-6">
                <span className={`inline-flex items-center gap-3 rounded-full backdrop-blur-md px-5 py-2 text-sm font-bold uppercase tracking-widest border shadow-lg transition-colors duration-700 ${
                  flash ? 'bg-white text-orange-600 border-white' : 'bg-white/50 text-slate-700 border-slate-200'
                }`}>
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${flash ? 'bg-orange-500' : 'bg-primary'}`} />
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${flash ? 'bg-orange-600' : 'bg-primary shadow-[0_0_8px_rgba(249,115,22,1)]'}`} />
                  </span>
                  Panggilan Saat Ini
                </span>
              </div>
              <div className="flex flex-col items-center mb-8">
                <span className={`text-[14rem] font-black leading-none tracking-tighter drop-shadow-2xl transition-colors duration-700 ${
                  flash ? 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]' : 'text-slate-900'
                }`}>
                  {latestCall.displayNumber}
                </span>
                <span className={`text-4xl font-black tracking-widest uppercase mt-4 transition-colors duration-700 ${
                  flash ? 'text-white drop-shadow-md' : 'text-slate-700'
                }`}>
                  {state.services.find((s) => s.code === latestCall.serviceCode)?.name}
                </span>
              </div>

              {latestCall.assignedLoket && (
                <div className={`mt-8 flex items-center gap-6 rounded-full px-5 py-4 pr-12 shadow-xl border transition-colors duration-700 ${
                  flash ? 'bg-white border-white shadow-black/20' : 'bg-gradient-to-r from-primary to-orange-500 border-orange-400/50 shadow-orange-500/20'
                }`}>
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center text-3xl font-black shadow-inner transition-colors duration-700 ${
                    flash ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' : 'bg-white text-primary'
                  }`}>
                    {latestCall.assignedLoket}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-700 ${
                      flash ? 'text-orange-500' : 'text-white/80'
                    }`}>
                      Silakan Menuju
                    </span>
                    <span className={`text-3xl font-black uppercase tracking-wide drop-shadow-sm transition-colors duration-700 ${
                      flash ? 'text-orange-600' : 'text-white'
                    }`}>
                      Loket {latestCall.assignedLoket}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center w-full h-full opacity-60 bg-white/40 backdrop-blur-md border border-white/50 rounded-[3rem] p-12">
              <div className="mb-6">
                <span className="inline-flex items-center gap-3 rounded-full bg-white/50 backdrop-blur-md px-5 py-2 text-sm font-bold text-slate-700 uppercase tracking-widest border border-slate-200 shadow-lg">
                  <span className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white/30" />
                  </span>
                  Panggilan Saat Ini
                </span>
              </div>
              <div className="flex flex-col items-center gap-4 mt-2">
                <div className="text-[14rem] font-black text-slate-500 leading-none">—</div>
                <p className="text-3xl font-bold tracking-wider text-slate-600 uppercase">Menunggu Panggilan...</p>
              </div>
            </div>
          )}


        </div>

        {/* ── RIGHT: Statistik & Daftar ── */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Menunggu', value: waitingTickets.length },
              { label: 'Selesai', value: doneTickets.length },
            ].map((s) => (
               <div key={s.label} className="flex flex-col items-center justify-center py-6 rounded-3xl bg-white/40 backdrop-blur-xl shadow-lg border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/50 rounded-bl-full pointer-events-none" />
                <span className="text-6xl font-black text-slate-900 relative z-10 drop-shadow-sm">{s.value}</span>
                <span className="text-sm font-black text-slate-800 uppercase tracking-widest mt-2 relative z-10">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Loket status list */}
          <div className="flex-1 bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col mt-2">
            <div className="bg-white/50 backdrop-blur-md px-6 py-5 border-b border-slate-200">
              <p className="text-sm font-black text-slate-700 uppercase tracking-widest text-center">
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
                      op.status === 'busy' ? 'border-primary/50 bg-orange-50' : 'border-slate-200 bg-white/40'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Loket {op.loket}</span>
                      <span className="text-lg font-black text-slate-900 drop-shadow-sm">{op.name}</span>
                    </div>
                    <div className="flex-1 border-b-2 border-dashed border-slate-300 mx-4" />
                    {ct ? (
                      <div className="flex items-center justify-center w-32 py-1.5 rounded-xl shadow-md border border-orange-400/50 bg-gradient-to-br from-orange-400 to-orange-500">
                        <span className="text-xl font-black text-white drop-shadow-sm">{ct.displayNumber}</span>
                      </div>
                    ) : op.status === 'available' ? (
                      <div className="flex items-center justify-center w-32 py-1.5 rounded-xl shadow-md border border-green-400/50 bg-green-500">
                        <span className="text-lg font-black text-white uppercase tracking-widest drop-shadow-sm">Siap</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-32 py-1.5">
                        <span className="text-xl font-black text-slate-300">—</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {state.operators.filter((o) => o.status !== 'offline').length === 0 && (
                <div className="flex-1 flex items-center justify-center opacity-40">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-700">Belum ada loket aktif</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER / ADMIN LINKS ── */}
      <div className="absolute bottom-0 left-0 w-full py-1.5 px-8 flex gap-6 text-[10px] font-black tracking-widest uppercase text-slate-700 bg-white/40 backdrop-blur-md z-20">
        <a href="#/antrean" className="hover:text-primary transition-colors">Admin</a>
        <a href="#/operator" className="hover:text-primary transition-colors">Operator</a>
        <a href="#/public" className="hover:text-primary transition-colors">Publik</a>
      </div>
      </div>
    </div>
  );
}
