import re

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'r') as f:
    content = f.read()

# Make text colors darker for better contrast on glass
content = content.replace('text-slate-800', 'text-slate-900')
content = content.replace('text-slate-600', 'text-slate-800')
content = content.replace('text-slate-500', 'text-slate-700')
content = content.replace('text-slate-400', 'text-slate-600')
content = content.replace('text-slate-300', 'text-slate-500')

# Also fix the fallback '—' dash colors so they are visible
content = content.replace('text-slate-500 leading-none">—</span>', 'text-slate-400 leading-none">—</span>')

# Fix ticker text
content = content.replace('text-lg font-bold tracking-wide text-slate-900', 'text-xl font-black tracking-wide text-slate-900')

# Right stats
content = content.replace('text-xs font-black text-slate-700 uppercase tracking-widest', 'text-sm font-black text-slate-800 uppercase tracking-widest')

# Clock
content = content.replace('text-[11px] font-black text-slate-700 uppercase', 'text-xs font-black text-slate-800 uppercase')

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Text colors darkened")
