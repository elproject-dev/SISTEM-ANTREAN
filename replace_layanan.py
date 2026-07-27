import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">TIKET</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center">TIPE PELANGGAN</th>
                <th className="px-4 py-3 font-bold border border-slate-200">PELANGGAN</th>""",
"""                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">TIKET</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center">TIPE PELANGGAN</th>
                <th className="px-4 py-3 font-bold border border-slate-200">LAYANAN</th>"""
)

content = content.replace(
"""                      <td className="px-4 py-3 border border-slate-200 text-sm font-medium text-slate-700">
                        <div className="font-bold text-slate-800">
                          {t.customerName || 'Umum'}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {SERVICES.find(s => s.code === t.serviceCode)?.name}
                        </div>
                      </td>""",
"""                      <td className="px-4 py-3 border border-slate-200 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          {SERVICES.find(s => s.code === t.serviceCode)?.name}
                        </div>
                      </td>"""
)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("done")
