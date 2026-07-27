import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = """          {/* Status Banner */}
          <div className={`p-4 rounded-xl border-2 flex items-center gap-3 font-bold text-sm ${
            liveOp.status === 'available' ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
            : liveOp.status === 'busy' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
            : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>"""

replacement = """          {/* Status Banner */}
          <div className={`p-4 rounded-xl border-2 flex items-center gap-3 font-bold text-sm backdrop-blur-md shadow-sm ${
            liveOp.status === 'available' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700'
            : liveOp.status === 'busy' ? 'bg-amber-500/20 border-amber-500/30 text-amber-800'
            : 'bg-slate-500/10 border-white/60 text-slate-500'
          }`}>"""

content = content.replace(target, replacement)

# Wait, we should also change the dot for 'available' to emerald-600 since it's on a light transparent background now
# currently it is bg-white
target_dot = """<span className={`relative inline-flex rounded-full h-3 w-3 ${liveOp.status === 'available' ? 'bg-white' : liveOp.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>"""
replacement_dot = """<span className={`relative inline-flex rounded-full h-3 w-3 ${liveOp.status === 'available' ? 'bg-emerald-600' : liveOp.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>"""

content = content.replace(target_dot, replacement_dot)

# Also fix the ping color for available (emerald-200 to emerald-400 for better visibility)
target_ping = """<span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveOp.status === 'available' ? 'bg-emerald-200' : 'bg-amber-400'}`}></span>"""
replacement_ping = """<span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveOp.status === 'available' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>"""

content = content.replace(target_ping, replacement_ping)


with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success mapping status banner to glass")
