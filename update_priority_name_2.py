import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target2 = """                      {t.customerName && (
                        <p className="text-xs font-bold text-slate-700">{t.customerName}</p>
                      )}"""

# Wait, in a previous step I changed it to NOT show "Pelanggan Umum" at all if it was missing:
# `{t.customerName && (<p>{t.customerName}</p>)}`
# If they want it to show "Pelanggan Prioritas", I should change it to:
# `<p>{t.customerName || (t.type === 'priority' ? 'Pelanggan Prioritas' : 'Pelanggan Umum')}</p>`

# Let's check what exactly is in the file right now
with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    print(f.read().find("t.customerName"))

