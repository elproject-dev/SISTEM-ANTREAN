import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = """                  <div className="pt-4 border-t border-slate-100 text-slate-500 font-medium">
                    <p className="text-lg text-slate-800 font-bold">
                      {currentTicket.customerName || 'Pelanggan Umum'}
                    </p>"""

replacement = """                  <div className="pt-4 border-t border-slate-100 text-slate-500 font-medium">
                    <p className="text-lg text-slate-800 font-bold">
                      {currentTicket.customerName || (currentTicket.type === 'priority' ? 'Pelanggan Prioritas' : 'Pelanggan Umum')}
                    </p>"""

content = content.replace(target, replacement)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success updating priority name")
