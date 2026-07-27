import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = """                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {SERVICES.find(s => s.code === t.serviceCode)?.name}
                        </p>"""

replacement = """                        <Badge variant="secondary" className="text-[9px] h-5 px-1.5 font-bold uppercase tracking-wider border-slate-200 shadow-sm text-slate-600">
                          {SERVICES.find(s => s.code === t.serviceCode)?.name}
                        </Badge>"""

content = content.replace(target, replacement)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success mapping service badge")
