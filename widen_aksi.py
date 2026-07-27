import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

# Make AKSI header wider
target_th = '<th className="px-4 py-3 font-bold border border-slate-200 text-center">AKSI</th>'
replacement_th = '<th className="px-4 py-3 font-bold border border-slate-200 text-center min-w-[200px] w-[220px]">AKSI</th>'
content = content.replace(target_th, replacement_th)

# Prevent wrapping
target_flex = 'className="flex items-center justify-center gap-1.5 flex-wrap"'
replacement_flex = 'className="flex items-center justify-center gap-1.5 flex-nowrap"'
content = content.replace(target_flex, replacement_flex)

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success widening AKSI")
