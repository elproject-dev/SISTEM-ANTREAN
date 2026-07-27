import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = """                  <div key={t.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all">
                    <div className="flex flex-col gap-2">
                      <div className="bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-lg w-fit shadow-sm">
                        <p className="font-black text-primary text-lg leading-none tracking-tight">{t.displayNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">"""

replacement = """                  <div key={t.id} className="p-2.5 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all">
                    <div className="flex flex-col gap-1.5">
                      <div className="bg-primary/5 border border-primary/20 px-2.5 py-1 rounded-md w-fit shadow-sm">
                        <p className="font-black text-primary text-base leading-none tracking-tight">{t.displayNumber}</p>
                      </div>
                      <div className="flex items-center gap-1.5">"""

content = content.replace(target, replacement)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success reducing scale")
