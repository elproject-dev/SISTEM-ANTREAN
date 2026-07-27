import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = """                    <div className="flex flex-col gap-1.5">
                      <p className="font-black text-primary text-lg leading-none">{t.displayNumber}</p>
                      <div className="flex items-center gap-2">"""

replacement = """                    <div className="flex flex-col gap-2">
                      <div className="bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-lg w-fit shadow-sm">
                        <p className="font-black text-primary text-lg leading-none tracking-tight">{t.displayNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">"""

content = content.replace(target, replacement)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success mapping 3")
