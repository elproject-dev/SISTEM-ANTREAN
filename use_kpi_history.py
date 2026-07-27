import re

with open('apps/sistem-antrean/src/pages/HistoryPage.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
import_old = "import { CustomButton } from '../components/CustomButton';"
import_new = "import { CustomButton } from '../components/CustomButton';\nimport { KpiCard } from '../components/KpiCard';\nimport { Users, CheckCircle, XCircle, Globe } from 'lucide-react';"
content = content.replace(import_old, import_new)

# 2. Update Stats Section
stats_old = """      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Antrean', value: state.tickets.length, color: 'text-slate-800' },
          { label: 'Selesai', value: doneCount, color: 'text-emerald-600' },
          { label: 'Dilewati', value: skippedCount, color: 'text-rose-500' },
          { label: 'Via Online', value: onlineCount, color: 'text-primary' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>"""

stats_new = """      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Total Antrean"
          value={state.tickets.length}
          icon={<Users size={18} className="text-white" />}
          gradientClass="bg-gradient-to-br from-slate-700 to-slate-800"
        />
        <KpiCard
          title="Selesai"
          value={doneCount}
          icon={<CheckCircle size={18} className="text-white" />}
          gradientClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <KpiCard
          title="Dilewati"
          value={skippedCount}
          icon={<XCircle size={18} className="text-white" />}
          gradientClass="bg-gradient-to-br from-rose-500 to-rose-600"
        />
        <KpiCard
          title="Via Online"
          value={onlineCount}
          icon={<Globe size={18} className="text-white" />}
          gradientClass="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>"""

content = content.replace(stats_old, stats_new)

with open('apps/sistem-antrean/src/pages/HistoryPage.tsx', 'w') as f:
    f.write(content)

print("KpiCard applied to HistoryPage")
