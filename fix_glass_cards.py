import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# 1. Antrean Saat Ini Card
content = content.replace(
    'bg-white rounded-2xl border-2 h-full min-h-[380px] flex flex-col overflow-hidden transition-all duration-300',
    'bg-white/60 backdrop-blur-xl border-white/60 rounded-2xl border-2 h-full min-h-[380px] flex flex-col overflow-hidden transition-all duration-300'
)
# Inner header for Antrean Saat Ini
content = content.replace(
    'className="p-4 border-b border-slate-100 bg-slate-50 text-center"',
    'className="p-4 border-b border-white/40 bg-white/40 text-center"'
)

# 2. Menunggu Panggilan Card
content = content.replace(
    'className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col"',
    'className="bg-white/60 backdrop-blur-xl rounded-2xl border-2 border-white/60 shadow-sm overflow-hidden flex-1 flex flex-col"'
)
# Inner header for Menunggu Panggilan
content = content.replace(
    'className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between"',
    'className="p-4 border-b border-white/40 bg-white/40 flex items-center justify-between"'
)
# And the list items inside Menunggu Panggilan which had `bg-white` on hover? No, they have `border-slate-200`. Let's make their border lighter.
content = content.replace(
    'border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300',
    'border border-white/60 bg-white/40 rounded-xl flex items-center justify-between hover:bg-white/70 hover:border-white/80'
)


# 3. Riwayat Pelayanan Card
content = content.replace(
    'className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8"',
    'className="bg-white/60 backdrop-blur-xl rounded-xl shadow-sm border border-white/60 overflow-hidden mt-8"'
)
# Inner header for Riwayat Pelayanan
content = content.replace(
    'justify-between bg-white gap-3',
    'justify-between bg-white/40 border-white/40 gap-3'
)
content = content.replace(
    '<div className="p-4 border-b border-slate-200 flex flex-row items-center',
    '<div className="p-4 border-b border-white/40 flex flex-row items-center'
)

# Table Header
content = content.replace(
    '<tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">',
    '<tr className="bg-white/50 text-slate-500 text-xs uppercase tracking-wider">'
)
# Table Data Cells: remove solid borders to transparent borders
content = content.replace(
    'border border-slate-200',
    'border border-white/40'
)
# Hover on table rows
content = content.replace(
    'transition-colors hover:bg-slate-50',
    'transition-colors hover:bg-white/60'
)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success making cards transparent")
