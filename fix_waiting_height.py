import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# Change flex-1 to a fixed height
old_div = '<div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">'
new_div = '<div className="p-4 flex flex-col gap-3 h-[290px] shrink-0 overflow-y-auto custom-scrollbar">'

content = content.replace(old_div, new_div)

# Also remove flex-1 from the parent to prevent stretching if any
old_parent = '<div className="bg-white backdrop-blur-xl rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">'
new_parent = '<div className="bg-white backdrop-blur-xl rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden flex flex-col">'

content = content.replace(old_parent, new_parent)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Applied fixed height to waiting list")
