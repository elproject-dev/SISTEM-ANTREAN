import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = """                  <div className="flex justify-center gap-2">
                    <Badge className={`font-bold text-xs ${
                      currentTicket.type === 'priority' ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' :
                      currentTicket.type === 'online' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' :
                      'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}>
                      {currentTicket.type === 'priority' ? '⭐ PRIORITAS' : currentTicket.type === 'online' ? '🌐 ONLINE' : '📄 OFFLINE'}
                    </Badge>
                    <Badge variant="secondary" className="font-bold text-xs">
                      {SERVICES.find((s) => s.code === currentTicket.serviceCode)?.name}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-slate-500 font-medium">
                    {currentTicket.customerName ? (
                      <p className="text-lg text-slate-800 font-bold">{currentTicket.customerName}</p>
                    ) : (
                      <p className="text-sm">Pelanggan Umum</p>
                    )}
                    {currentTicket.purpose && <p className="text-xs mt-1">{currentTicket.purpose}</p>}
                  </div>"""

replacement = """                  <div className="flex justify-center gap-2">
                    <Badge className={`font-bold text-xs shadow-sm ${
                      currentTicket.type === 'priority' ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' :
                      currentTicket.type === 'online' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' :
                      'bg-slate-500 hover:bg-slate-600 text-white border-0'
                    }`}>
                      {currentTicket.type === 'priority' ? 'PRIORITAS' : currentTicket.type === 'online' ? 'ONLINE' : 'OFFLINE'}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-slate-500 font-medium">
                    <p className="text-lg text-slate-800 font-bold">
                      {currentTicket.customerName || 'Pelanggan Umum'}
                    </p>
                    <p className="text-xs font-bold text-primary mt-1 uppercase tracking-wider">
                      {SERVICES.find((s) => s.code === currentTicket.serviceCode)?.name}
                    </p>
                    {currentTicket.purpose && <p className="text-xs mt-1 text-slate-500">{currentTicket.purpose}</p>}
                  </div>"""

content = content.replace(target, replacement)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success fix type badge")
