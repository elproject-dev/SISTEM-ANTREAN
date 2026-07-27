import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = """                  <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-bold text-xs uppercase tracking-widest mb-2">
                    {currentTicket.status === 'calling' ? '📣 Sedang Diproses' : '✅ Dalam Pelayanan'}
                  </div>"""

replacement = """                  <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500 text-white shadow-sm font-bold text-xs uppercase tracking-widest mb-2">
                    {currentTicket.status === 'calling' ? 'Sedang Diproses' : 'Dalam Pelayanan'}
                  </div>"""

content = content.replace(target, replacement)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success fix badge")
