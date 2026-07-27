import re

with open('apps/sistem-antrean/src/pages/AntreanPage.tsx', 'r') as f:
    content = f.read()

loket_status_block = """      {/* ── Loket Status ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map(loket => {
          const op = state.operators.find(o => o.loket === loket && o.status !== 'offline');
          
          let statusText = 'Tutup';
          let statusColor = 'text-slate-400';
          let dotColor = 'bg-slate-300';
          let border = 'border-slate-200 bg-slate-50 opacity-70';

          if (op) {
             if (op.status === 'busy') {
                 statusText = 'Melayani';
                 statusColor = 'text-amber-600';
                 dotColor = 'bg-amber-500 animate-pulse';
                 border = 'border-amber-200 bg-amber-50';
             } else {
                 statusText = 'Kosong';
                 statusColor = 'text-emerald-600';
                 dotColor = 'bg-emerald-500';
                 border = 'border-emerald-200 bg-emerald-50';
             }
          }

          return (
             <div key={loket} className={`rounded-xl border p-3 flex flex-col justify-center items-center text-center ${border} transition-all shadow-sm`}>
               <div className="flex items-center gap-2 mb-1">
                 <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                 <span className="font-bold text-sm text-slate-700">Loket {loket}</span>
               </div>
               <span className={`text-xs font-bold ${statusColor}`}>{statusText}</span>
               {op && <span className="text-[10px] text-slate-500 font-medium truncate w-full mt-0.5">{op.name}</span>}
             </div>
          );
        })}
      </div>

"""

# Insert right before {/* ── Table Section ── */}
content = content.replace('{/* ── Table Section ── */}', loket_status_block + '      {/* ── Table Section ── */}')

with open('apps/sistem-antrean/src/pages/AntreanPage.tsx', 'w') as f:
    f.write(content)

print("Success inserting loket status")
