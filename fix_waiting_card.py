import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

old_jsx = """                waitingTickets.map(t => (
                  <div key={t.id} className="p-2.5 border border-slate-200 bg-white/40 rounded-xl flex items-center justify-between hover:bg-white/70 hover:border-white/80 transition-all">
                    <div className="flex flex-col gap-1.5">
                      <div className="bg-primary/5 border border-primary/20 px-2.5 py-1 rounded-md w-fit shadow-sm">
                        <p className="font-black text-primary text-base leading-none tracking-tight">{t.displayNumber}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`text-[10px] h-5 px-1.5 font-bold shadow-sm ${
                          t.type === 'priority' ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' :
                          t.type === 'online' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' :
                          'bg-slate-500 hover:bg-slate-600 text-white border-0'
                        }`}>
                          {t.type === 'priority' ? 'PRIORITAS' : t.type === 'online' ? 'ONLINE' : 'OFFLINE'}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] h-5 px-1.5 font-bold uppercase tracking-wider border-slate-200 shadow-sm text-slate-600">
                          {SERVICES.find(s => s.code === t.serviceCode)?.name}
                        </Badge>
                      </div>
                      {t.customerName && (
                        <p className="text-xs font-bold text-slate-700">{t.customerName}</p>
                      )}
                    </div>
                    <CustomButton
                      variant="primary"
                      disabled={liveOp.status === 'busy'}
                      onClick={() => callAssignedTicket(liveOp.id, t.id)}
                      className="px-3 py-1.5 h-8 text-xs shrink-0"
                    >
                      Panggil
                    </CustomButton>
                  </div>
                ))"""

new_jsx = """                waitingTickets.map(t => (
                  <div key={t.id} className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex items-stretch overflow-hidden">
                    {/* Color Strip */}
                    <div className={`w-1.5 shrink-0 ${
                          t.type === 'priority' ? 'bg-amber-500' :
                          t.type === 'online' ? 'bg-emerald-500' :
                          'bg-slate-400'
                    }`} />
                    
                    <div className="p-3.5 flex-1 flex items-center justify-between gap-3 bg-gradient-to-r from-white to-slate-50/50">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <span className="font-black text-slate-700 text-lg leading-none tracking-tight">{t.displayNumber}</span>
                           <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${
                             t.type === 'priority' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                             t.type === 'online' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                             'bg-slate-50 text-slate-600 border-slate-200'
                           }`}>
                             {t.type === 'priority' ? 'Prioritas' : t.type}
                           </span>
                        </div>
                        
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                             {SERVICES.find(s => s.code === t.serviceCode)?.name}
                           </span>
                           {t.customerName && (
                             <span className="text-[11px] font-bold text-primary mt-0.5">{t.customerName}</span>
                           )}
                        </div>
                      </div>
                      
                      <CustomButton
                        variant="primary"
                        disabled={liveOp.status === 'busy'}
                        onClick={() => callAssignedTicket(liveOp.id, t.id)}
                        className="px-4 py-2 h-auto text-xs shrink-0 shadow-sm"
                      >
                        Panggil
                      </CustomButton>
                    </div>
                  </div>
                ))"""

content = content.replace(old_jsx, new_jsx)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Card redesign successful")
