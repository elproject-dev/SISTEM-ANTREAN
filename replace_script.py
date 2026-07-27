import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">WAKTU</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">TIKET</th>
                <th className="px-4 py-3 font-bold border border-slate-200">PELANGGAN</th>""",
"""                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">WAKTU</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">TIKET</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center">TIPE PELANGGAN</th>
                <th className="px-4 py-3 font-bold border border-slate-200">PELANGGAN</th>"""
)

content = content.replace(
"""              {servedToday.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 border-b border-slate-200">""",
"""              {servedToday.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 border-b border-slate-200">"""
)

content = content.replace(
"""                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <span className="font-black text-lg text-primary">{t.displayNumber}</span>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-sm font-medium text-slate-700">""",
"""                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <span className="font-black text-lg text-primary">{t.displayNumber}</span>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <Badge className={`text-xs h-6 px-2.5 font-bold text-white border-0 shadow-sm ${
                          t.type === 'priority' ? 'bg-amber-500 hover:bg-amber-600' :
                          t.type === 'online' ? 'bg-emerald-500 hover:bg-emerald-600' :
                          'bg-slate-400 hover:bg-slate-500'
                        }`}>
                          {t.type === 'priority' ? 'PRIORITAS' : t.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-sm font-medium text-slate-700">"""
)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("done")
