import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# 1. Extract the Stats Row (which currently only has 3 cards because my last script failed silently)
stats_row_pattern = r'(\s*{/\* Stats Row \*/}.*?</div>)'
# But wait, it spans multiple lines. Let's write a robust regex.
# Actually, the div ends with <Clock ... /> \n </div> \n </div>
# Let's find exactly between "          {/* Stats Row */}" and "          {/* Status Banner */}"
stats_row_match = re.search(r'(\s*{/\* Stats Row \*/}.*?)(?=\s*{/\* Status Banner \*/})', content, re.DOTALL)
if stats_row_match:
    stats_row_block = stats_row_match.group(1)
    content = content.replace(stats_row_block, '')
    
    # Let's build the 4 cards block we want
    # Since we removed it, we'll just reconstruct the 4-card block beautifully.
    four_cards_block = """
      {/* ── KPI Cards (4 Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Menunggu"
          value={waitingTickets.length}
          footerText="Antrean tersisa"
          gradientClass="bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500"
          icon={<User className="w-4 h-4 text-white" />}
        />
        <KpiCard
          title="Total Dilayani"
          value={liveOp.totalServed}
          footerText="Antrean diselesaikan"
          gradientClass="bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500"
          icon={<CheckCircle2 className="w-4 h-4 text-white" />}
        />
        <KpiCard
          title="Dilewati"
          value={liveOp.totalSkipped}
          footerText="Antrean dilewati"
          gradientClass="bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500"
          icon={<XCircle className="w-4 h-4 text-white" />}
        />
        <KpiCard
          title="Rata-rata Waktu"
          value={avgSeconds > 0 ? (avgSeconds < 60 ? `${avgSeconds}d` : `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}d`) : '—'}
          footerText="Per pelayanan"
          gradientClass="bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600"
          icon={<Clock className="w-4 h-4 text-white" />}
        />
      </div>
"""
    
    # We want to insert four_cards_block right after `</PageHeaderCard>`
    insert_pos = content.find("</PageHeaderCard>") + len("</PageHeaderCard>")
    content = content[:insert_pos] + "\n" + four_cards_block + content[insert_pos:]
    
    # Also, we need to make sure the right column (Menunggu Panggilan + Status Banner) still exists nicely.
    # Currently, `lg:col-span-2` only contains:
    # {/ * Status Banner * /}
    # {/ * Menunggu Panggilan * /}
    # which is perfectly fine.
    
    with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
        f.write(content)
    print("Success Restructuring")
else:
    print("Failed to find Stats Row")
