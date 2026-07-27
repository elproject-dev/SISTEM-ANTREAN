import re

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'r') as f:
    content = f.read()

old_header = """      {/* ── TOP BAR ── */}
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
      </header>"""

new_header = """      {/* ── TOP BAR ── */}
      <header className="relative z-10 px-8 py-6 grid grid-cols-6 gap-6 items-stretch">
        {[1, 2, 3, 4, 5].map((loketNumber) => {
          const op = state.operators.find((o) => o.loket === loketNumber && o.status !== 'offline');
          const ct = op?.currentTicketId ? state.tickets.find((t) => t.id === op.currentTicketId) : null;
          return (
            <div key={loketNumber} className={`flex flex-col items-center justify-center rounded-3xl border py-6 px-4 transition-all duration-500 shadow-xl ${
                op && ct ? 'bg-gradient-to-br from-primary to-orange-600 border-orange-400/50 shadow-orange-500/20 scale-105' : 
                op ? 'bg-white/10 backdrop-blur-md border-white/20' : 
                'bg-black/20 backdrop-blur-sm border-transparent opacity-50'
              }`}>
              <span className={`text-base font-black uppercase tracking-widest ${op && ct ? 'text-white/90' : 'text-white/60'}`}>
                Loket {loketNumber}
              </span>
              {ct ? (
                <span className="text-6xl font-black text-white mt-2 leading-none drop-shadow-lg">{ct.displayNumber}</span>
              ) : (
                <span className="text-5xl font-bold text-white/20 mt-2 leading-none">—</span>
              )}
            </div>
          );
        })}
        
        {/* Clock Card */}
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl py-6 px-4">
          <LiveClock />
        </div>
      </header>"""

content = content.replace(old_header, new_header)

old_clock = """// ─── Clock ────────────────────────────────────────────────────────────────────
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
}"""

new_clock = """// ─── Clock ────────────────────────────────────────────────────────────────────
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="text-[2rem] font-black font-mono tabular-nums text-white tracking-tight drop-shadow-lg leading-none">
        {t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-[11px] font-black text-white/70 uppercase tracking-widest mt-2 text-center leading-tight">
        {t.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    </div>
  );
}"""

content = content.replace(old_clock, new_clock)

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Header layout fixed.")
