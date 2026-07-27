import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = """                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-primary text-lg leading-none">{t.displayNumber}</p>
                        <Badge className={`text-[10px] h-5 px-1.5 font-bold shadow-sm ${
                          t.type === 'priority' ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' :
                          t.type === 'online' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' :
                          'bg-slate-500 hover:bg-slate-600 text-white border-0'
                        }`}>
                          {t.type === 'priority' ? 'PRIORITAS' : t.type === 'online' ? 'ONLINE' : 'OFFLINE'}
                        </Badge>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-slate-700">{t.customerName || 'Pelanggan Umum'}</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{SERVICES.find(s => s.code === t.serviceCode)?.name}</p>
                      </div>
                    </div>"""

replacement = """                    <div className="flex flex-col gap-1.5">
                      <p className="font-black text-primary text-lg leading-none">{t.displayNumber}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] h-5 px-1.5 font-bold shadow-sm ${
                          t.type === 'priority' ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' :
                          t.type === 'online' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' :
                          'bg-slate-500 hover:bg-slate-600 text-white border-0'
                        }`}>
                          {t.type === 'priority' ? 'PRIORITAS' : t.type === 'online' ? 'ONLINE' : 'OFFLINE'}
                        </Badge>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {SERVICES.find(s => s.code === t.serviceCode)?.name}
                        </p>
                      </div>
                      {t.customerName && (
                        <p className="text-xs font-bold text-slate-700">{t.customerName}</p>
                      )}
                    </div>"""

content = content.replace(target, replacement)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success mapping 2")
