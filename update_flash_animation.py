import re

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'r') as f:
    content = f.read()

old_block = """          {latestCall ? (
            <div className={`flex flex-col items-center text-center justify-center w-full h-full bg-white/40 backdrop-blur-xl border border-white/50 rounded-[3rem] p-12 shadow-2xl transition-all duration-500 ${flash ? 'scale-105 bg-primary/20 border-primary/50 shadow-primary/30' : ''}`}>
              <div className="mb-6">
                <span className="inline-flex items-center gap-3 rounded-full bg-white/50 backdrop-blur-md px-5 py-2 text-sm font-bold text-slate-700 uppercase tracking-widest border border-slate-200 shadow-lg">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_8px_rgba(249,115,22,1)]" />
                  </span>
                  Panggilan Saat Ini
                </span>
              </div>
              <div className="flex flex-col items-center mb-8">
                <span className={`text-[14rem] font-black leading-none tracking-tighter drop-shadow-2xl ${flash ? 'text-white' : 'text-slate-900'}`}>
                  {latestCall.displayNumber}
                </span>
                <span className="text-4xl font-black tracking-widest text-slate-700 uppercase mt-4">
                  {state.services.find((s) => s.code === latestCall.serviceCode)?.name}
                </span>
              </div>

              {latestCall.assignedLoket && (
                <div className="mt-8 flex items-center gap-6 bg-gradient-to-r from-primary to-orange-500 rounded-full px-5 py-4 pr-12 shadow-xl shadow-orange-500/20 border border-orange-400/50">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-3xl font-black text-primary shadow-inner">
                    {latestCall.assignedLoket}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                      Silakan Menuju
                    </span>
                    <span className="text-3xl font-black text-white uppercase tracking-wide drop-shadow-sm">
                      Loket {latestCall.assignedLoket}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : ("""

new_block = """          {latestCall ? (
            <div className={`flex flex-col items-center text-center justify-center w-full h-full rounded-[3rem] p-12 shadow-2xl transition-all duration-700 ease-out ${
              flash 
                ? 'scale-[1.02] bg-gradient-to-br from-orange-400 to-orange-500 border-4 border-white shadow-[0_0_80px_rgba(249,115,22,0.8)] animate-pulse' 
                : 'bg-white/40 backdrop-blur-xl border border-white/50'
            }`}>
              <div className="mb-6">
                <span className={`inline-flex items-center gap-3 rounded-full backdrop-blur-md px-5 py-2 text-sm font-bold uppercase tracking-widest border shadow-lg transition-colors duration-700 ${
                  flash ? 'bg-white text-orange-600 border-white' : 'bg-white/50 text-slate-700 border-slate-200'
                }`}>
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${flash ? 'bg-orange-500' : 'bg-primary'}`} />
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${flash ? 'bg-orange-600' : 'bg-primary shadow-[0_0_8px_rgba(249,115,22,1)]'}`} />
                  </span>
                  Panggilan Saat Ini
                </span>
              </div>
              <div className="flex flex-col items-center mb-8">
                <span className={`text-[14rem] font-black leading-none tracking-tighter drop-shadow-2xl transition-colors duration-700 ${
                  flash ? 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]' : 'text-slate-900'
                }`}>
                  {latestCall.displayNumber}
                </span>
                <span className={`text-4xl font-black tracking-widest uppercase mt-4 transition-colors duration-700 ${
                  flash ? 'text-white drop-shadow-md' : 'text-slate-700'
                }`}>
                  {state.services.find((s) => s.code === latestCall.serviceCode)?.name}
                </span>
              </div>

              {latestCall.assignedLoket && (
                <div className={`mt-8 flex items-center gap-6 rounded-full px-5 py-4 pr-12 shadow-xl border transition-colors duration-700 ${
                  flash ? 'bg-white border-white shadow-black/20' : 'bg-gradient-to-r from-primary to-orange-500 border-orange-400/50 shadow-orange-500/20'
                }`}>
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center text-3xl font-black shadow-inner transition-colors duration-700 ${
                    flash ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' : 'bg-white text-primary'
                  }`}>
                    {latestCall.assignedLoket}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-700 ${
                      flash ? 'text-orange-500' : 'text-white/80'
                    }`}>
                      Silakan Menuju
                    </span>
                    <span className={`text-3xl font-black uppercase tracking-wide drop-shadow-sm transition-colors duration-700 ${
                      flash ? 'text-orange-600' : 'text-white'
                    }`}>
                      Loket {latestCall.assignedLoket}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : ("""

content = content.replace(old_block, new_block)

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Flash animation applied")
