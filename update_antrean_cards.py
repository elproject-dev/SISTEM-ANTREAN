import re

with open('apps/sistem-antrean/src/pages/AntreanPage.tsx', 'r') as f:
    content = f.read()

old_block = """          let statusText = 'Tutup';
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
               </div>"""

new_block = """          let statusText = 'Tutup';
          let statusColor = 'text-slate-200';
          let rightElement = <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-slate-300" />;
          let cardStyle = 'bg-gradient-to-br from-slate-500 to-slate-600 border-slate-700 opacity-80';

          if (op) {
             if (op.status === 'busy') {
                 statusText = 'Sedang Melayani';
                 statusColor = 'text-orange-100';
                 const ct = state.tickets.find((t) => t.id === op.currentTicketId);
                 if (ct) {
                     rightElement = <span className="text-[10px] font-black bg-white text-orange-600 px-2 py-0.5 rounded-md shadow-sm tracking-wider">{ct.displayNumber}</span>;
                 } else {
                     rightElement = <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />;
                 }
                 cardStyle = 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600 shadow-md shadow-orange-600/30';
             } else {
                 statusText = 'Kosong';
                 statusColor = 'text-emerald-100';
                 rightElement = <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />;
                 cardStyle = 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 shadow-md shadow-emerald-600/30';
             }
          }

          return (
             <div key={loket} className={`rounded-xl border p-3.5 flex flex-col justify-between text-left ${cardStyle} text-white transition-all`}>
               <div className="flex items-center justify-between mb-3">
                 <span className="font-black tracking-wider text-xs text-white/90 uppercase drop-shadow-sm">LOKET {loket}</span>
                 {rightElement}
               </div>"""

content = content.replace(old_block, new_block)

with open('apps/sistem-antrean/src/pages/AntreanPage.tsx', 'w') as f:
    f.write(content)

print("Updated AntreanPage loket cards")
