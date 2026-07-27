import re

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'r') as f:
    content = f.read()

# 1. Overlay
content = content.replace(
    '<div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply z-0" />',
    '<div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-0" />'
)

# 2. Ticker
content = content.replace(
    'bg-slate-900/40 backdrop-blur-md border-b border-white/10',
    'bg-white/80 backdrop-blur-md border-b border-white/50'
)
content = content.replace(
    'text-lg font-bold tracking-wide text-white',
    'text-lg font-bold tracking-wide text-slate-800'
)

# 3. Header Loket Cards & Clock
content = content.replace(
    "op ? 'bg-white/10 backdrop-blur-md border-white/20' :",
    "op ? 'bg-white/80 backdrop-blur-xl border-white/50' :"
)
content = content.replace(
    "'bg-black/20 backdrop-blur-sm border-transparent opacity-50'",
    "'bg-slate-100/60 backdrop-blur-sm border-slate-200 opacity-60'"
)
content = content.replace(
    "op && ct ? 'text-white/90' : 'text-white/60'",
    "op && ct ? 'text-white' : 'text-slate-500'"
)
content = content.replace(
    'text-6xl font-black text-white mt-2 leading-none drop-shadow-lg text-center w-full',
    'text-6xl font-black text-slate-800 mt-2 leading-none drop-shadow-sm text-center w-full'
)
content = content.replace(
    'text-5xl font-bold text-white/20 mt-2 leading-none text-center w-full',
    'text-5xl font-bold text-slate-300 mt-2 leading-none text-center w-full'
)

content = content.replace(
    'bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl py-6 px-4',
    'bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl py-6 px-4'
)
content = content.replace(
    'text-[2rem] font-black font-mono tabular-nums text-white tracking-tight drop-shadow-lg leading-none',
    'text-[2rem] font-black font-mono tabular-nums text-slate-800 tracking-tight drop-shadow-sm leading-none'
)
content = content.replace(
    'text-[11px] font-black text-white/70 uppercase tracking-widest mt-2 text-center leading-tight',
    'text-[11px] font-black text-slate-500 uppercase tracking-widest mt-2 text-center leading-tight'
)

# 4. Big Card
content = content.replace(
    'bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 shadow-2xl',
    'bg-white/80 backdrop-blur-xl border border-white/50 rounded-[3rem] p-12 shadow-2xl'
)
content = content.replace(
    'bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-bold text-white uppercase tracking-widest border border-white/20',
    'bg-white/90 backdrop-blur-md px-5 py-2 text-sm font-bold text-slate-700 uppercase tracking-widest border border-slate-200'
)
content = content.replace(
    "flash ? 'text-white' : 'text-primary'",
    "flash ? 'text-white' : 'text-slate-800'"
)
content = content.replace(
    'text-4xl font-black tracking-widest text-white/70 uppercase mt-4',
    'text-4xl font-black tracking-widest text-slate-500 uppercase mt-4'
)
content = content.replace(
    'opacity-50 bg-white/5 backdrop-blur-md border border-white/10',
    'opacity-60 bg-white/60 backdrop-blur-md border border-white/50'
)
content = content.replace(
    'text-[14rem] font-black text-white leading-none">—</div>',
    'text-[14rem] font-black text-slate-300 leading-none">—</div>'
)
content = content.replace(
    'text-3xl font-bold tracking-wider text-white uppercase">Menunggu Panggilan',
    'text-3xl font-bold tracking-wider text-slate-400 uppercase">Menunggu Panggilan'
)

# 5. Right Stats
content = content.replace(
    'bg-white/10 backdrop-blur-xl shadow-lg border border-white/20',
    'bg-white/80 backdrop-blur-xl shadow-lg border border-white/50'
)
content = content.replace(
    'w-32 h-32 bg-white/5 rounded-bl-full',
    'w-32 h-32 bg-slate-100/50 rounded-bl-full'
)
content = content.replace(
    'text-6xl font-black text-white relative z-10 drop-shadow-md',
    'text-6xl font-black text-slate-800 relative z-10 drop-shadow-sm'
)
content = content.replace(
    'text-xs font-black text-white/60 uppercase tracking-widest mt-2 relative z-10',
    'text-xs font-black text-slate-500 uppercase tracking-widest mt-2 relative z-10'
)

# 6. Right List
content = content.replace(
    'bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col mt-2',
    'bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col mt-2'
)
content = content.replace(
    'bg-white/10 backdrop-blur-md px-6 py-5 border-b border-white/10',
    'bg-white/90 backdrop-blur-md px-6 py-5 border-b border-slate-200'
)
content = content.replace(
    'text-sm font-black text-white uppercase tracking-widest text-center',
    'text-sm font-black text-slate-700 uppercase tracking-widest text-center'
)
content = content.replace(
    "op.status === 'busy' ? 'border-primary/50 bg-primary/10' : 'border-white/10 bg-white/5'",
    "op.status === 'busy' ? 'border-primary/50 bg-orange-50' : 'border-slate-200 bg-white/60'"
)
content = content.replace(
    'text-[10px] font-black text-white/50 uppercase tracking-widest',
    'text-[10px] font-black text-slate-500 uppercase tracking-widest'
)
content = content.replace(
    'text-lg font-black text-white drop-shadow-sm',
    'text-lg font-black text-slate-800 drop-shadow-sm'
)
content = content.replace(
    'border-b-2 border-dashed border-white/20',
    'border-b-2 border-dashed border-slate-300'
)
content = content.replace(
    "op.status === 'available' ? 'text-white/80' : 'text-white/30'",
    "op.status === 'available' ? 'text-slate-600' : 'text-slate-300'"
)
content = content.replace(
    'text-sm font-bold uppercase tracking-widest text-white">Belum ada loket aktif',
    'text-sm font-bold uppercase tracking-widest text-slate-500">Belum ada loket aktif'
)

# 7. Footer
content = content.replace(
    'text-white/30 bg-black/40 backdrop-blur-md',
    'text-slate-500 bg-white/80 backdrop-blur-md'
)

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Light mode theme applied")
