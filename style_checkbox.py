import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = r"className=\{`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 \$\{active \? 'bg-primary border-primary text-white' : 'border-slate-300'\}`\}"
replacement = r"className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${active ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-white border-slate-300 shadow-inner'}`}"

content = re.sub(target, replacement, content)

target_icon = r"\{active && <Check size=\{14\} strokeWidth=\{3\} />\}"
replacement_icon = r"{active && <Check size={14} strokeWidth={4} color=\"white\" />}"

content = re.sub(target_icon, replacement_icon, content)

# Active button background
target_active = r"'bg-primary/10 text-primary'"
replacement_active = r"'bg-orange-100 text-orange-600 border border-orange-200'"
content = content.replace(target_active, replacement_active)


with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success styling checkbox")
