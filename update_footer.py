import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""            <KpiCard
              title="Total Dilayani"
              value={liveOp.totalServed}
              gradientClass="bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500"
              icon={<CheckCircle2 className="w-4 h-4 text-white" />}
            />""",
"""            <KpiCard
              title="Total Dilayani"
              value={liveOp.totalServed}
              footerText="Antrean diselesaikan"
              gradientClass="bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500"
              icon={<CheckCircle2 className="w-4 h-4 text-white" />}
            />"""
)

content = content.replace(
"""            <KpiCard
              title="Dilewati"
              value={liveOp.totalSkipped}
              gradientClass="bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500"
              icon={<XCircle className="w-4 h-4 text-white" />}
            />""",
"""            <KpiCard
              title="Dilewati"
              value={liveOp.totalSkipped}
              footerText="Antrean dilewati"
              gradientClass="bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500"
              icon={<XCircle className="w-4 h-4 text-white" />}
            />"""
)

content = content.replace(
"""            <KpiCard
              title="Rata-rata Waktu"
              value={avgSeconds > 0 ? (avgSeconds < 60 ? `${avgSeconds}d` : `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}d`) : '—'}
              gradientClass="bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600"
              icon={<Clock className="w-4 h-4 text-white" />}
            />""",
"""            <KpiCard
              title="Rata-rata Waktu"
              value={avgSeconds > 0 ? (avgSeconds < 60 ? `${avgSeconds}d` : `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}d`) : '—'}
              footerText="Per pelayanan"
              gradientClass="bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600"
              icon={<Clock className="w-4 h-4 text-white" />}
            />"""
)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success")
