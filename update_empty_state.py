import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = """                    <p className="font-bold text-slate-600">Belum Ada Antrean</p>
                    <p className="text-xs mt-1">Harap menunggu admin memberikan antrean ke loket Anda.</p>"""

replacement = """                    <p className="font-bold text-slate-600">
                      {waitingTickets.length > 0 ? `Ada ${waitingTickets.length} Antrean saat ini` : 'Belum Ada Antrean'}
                    </p>
                    <p className="text-xs mt-1">
                      {waitingTickets.length > 0 ? 'Silakan tekan tombol Panggil pada daftar antrean.' : 'Harap menunggu admin memberikan antrean ke loket Anda.'}
                    </p>"""

content = content.replace(target, replacement)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success mapping")
