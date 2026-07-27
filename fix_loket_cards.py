import re

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'r') as f:
    content = f.read()

old_card = """        {[1, 2, 3, 4, 5].map((loketNumber) => {
          const op = state.operators.find((o) => o.loket === loketNumber && o.status !== 'offline');
          const ct = op?.currentTicketId ? state.tickets.find((t) => t.id === op.currentTicketId) : null;
          return (
            <div key={loketNumber} className={`flex flex-col items-center justify-center text-center rounded-3xl border py-6 px-4 transition-all duration-500 shadow-xl ${
                op && ct ? 'bg-gradient-to-br from-primary to-orange-600 border-orange-400/50 shadow-orange-500/20 scale-105' : 
                op ? 'bg-white/40 backdrop-blur-xl border-white/50' : 
                'bg-white/30 backdrop-blur-sm border-slate-200 opacity-60'
              }`}>
              <span className={`text-base font-black uppercase tracking-widest text-center w-full ${op && ct ? 'text-white' : 'text-slate-500'}`}>
                Loket {loketNumber}
              </span>
              {ct ? (
                <span className="text-6xl font-black text-slate-800 mt-2 leading-none drop-shadow-sm text-center w-full">{ct.displayNumber}</span>
              ) : (
                <span className="text-5xl font-bold text-slate-300 mt-2 leading-none text-center w-full">—</span>
              )}
            </div>
          );
        })}"""

new_card = """        {[1, 2, 3, 4, 5].map((loketNumber) => {
          const op = state.operators.find((o) => o.loket === loketNumber && o.status !== 'offline');
          const ct = op?.currentTicketId ? state.tickets.find((t) => t.id === op.currentTicketId) : null;
          return (
            <div key={loketNumber} className={`flex flex-col items-stretch justify-center transition-all duration-500 drop-shadow-xl h-full ${op && ct ? 'scale-105' : ''}`}>
              {/* Header Blok Loket */}
              <div className={`py-2 px-4 border border-b-0 rounded-t-3xl flex items-center justify-center text-center ${
                op && ct ? 'bg-primary border-primary' : 
                op ? 'bg-white/60 border-white/50 backdrop-blur-md' : 
                'bg-white/30 border-white/30 backdrop-blur-sm opacity-60'
              }`}>
                <span className={`text-sm font-black uppercase tracking-widest ${op && ct ? 'text-white' : 'text-slate-600'}`}>
                  Loket {loketNumber}
                </span>
              </div>
              
              {/* Blok Angka Tiket */}
              <div className={`flex-1 flex items-center justify-center border rounded-b-3xl px-4 py-6 ${
                op && ct ? 'bg-white/90 border-white/50 backdrop-blur-xl' : 
                op ? 'bg-white/40 border-white/50 backdrop-blur-xl' : 
                'bg-white/20 border-white/30 backdrop-blur-sm opacity-60'
              }`}>
                {ct ? (
                  <span className="text-6xl font-black text-slate-800 leading-none drop-shadow-sm">{ct.displayNumber}</span>
                ) : (
                  <span className="text-5xl font-bold text-slate-300 leading-none">—</span>
                )}
              </div>
            </div>
          );
        })}"""

content = content.replace(old_card, new_card)

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Split Loket card updated")
