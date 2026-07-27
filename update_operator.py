import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# Locate the History Table and the grid
history_table_pattern = r"(\s*{/\* History Table \*/}.*?)(?=\s*</div>\s*</div>\s*</div>\s*\);\s*})"

match = re.search(history_table_pattern, content, re.DOTALL)
if match:
    history_table = match.group(1)
    
    # We will remove history_table from its current place
    content = content.replace(history_table, "")
    
    # Now we want to insert it after the end of the grid.
    # The grid ends at `      </div>\n    </div>\n  );\n}` before the change
    # Wait, the grid was closed by `</div>\n      </div>\n    </div>\n  );\n}`
    
    new_history_table = """
      {/* ── Table Section ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-4 border-b border-slate-200 flex flex-row items-center justify-between bg-white gap-3">
          <div className="flex items-center space-x-2 truncate">
            <h2 className="font-bold text-slate-800 text-lg">Riwayat Pelayanan Loket {liveOp.loket}</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">({servedToday.length} Antrean)</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">WAKTU</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center w-28">TIKET</th>
                <th className="px-4 py-3 font-bold border border-slate-200">PELANGGAN</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center">DURASI</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {servedToday.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 border-b border-slate-200">
                    <p className="font-bold text-base text-slate-600 mb-1">Belum ada riwayat</p>
                    <p className="text-xs">Anda belum melayani pelanggan hari ini.</p>
                  </td>
                </tr>
              ) : (
                servedToday.slice().reverse().map((t) => {
                  const time = new Date(t.takenAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  const dur = t.doneAt && t.calledAt
                      ? Math.round((t.doneAt - t.calledAt) / 1000)
                      : null;
                  const sc = STATUS_LABEL[t.status] ?? { label: t.status, variant: 'slate' as BadgeVariant };

                  return (
                    <tr key={t.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 border border-slate-200 text-center text-sm font-semibold text-slate-600">
                        {time}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <span className="font-black text-lg text-primary">{t.displayNumber}</span>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-sm font-medium text-slate-700">
                        <div className="font-bold text-slate-800">
                          {t.customerName || 'Umum'}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {SERVICES.find(s => s.code === t.serviceCode)?.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center text-sm font-medium text-slate-600">
                        {dur !== null ? (dur < 60 ? `${dur}d` : `${Math.floor(dur / 60)}m ${dur % 60}d`) : '-'}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <CustomStatusBadge variant={sc.variant} label={sc.label} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
"""
    
    # We will insert new_history_table right before the last closing </div> that wraps the whole OperatorPage
    # In OperatorPage, the render looks like:
    # return (
    #   <div className="w-full space-y-8 ...">
    #     <PageHeaderCard />
    #     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    #       ...
    #     </div>
    #     {new_history_table}
    #   </div>
    # );
    
    content = content.replace("        </div>\n      </div>\n    </div>\n  );\n}", "        </div>\n      </div>\n" + new_history_table + "\n    </div>\n  );\n}")
    
    with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Failed to find history table")
