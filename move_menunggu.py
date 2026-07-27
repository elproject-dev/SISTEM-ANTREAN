import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

menunggu_pattern = r"(\s*{/\* ── Antrean Menunggu ── \*/}.*?)(?=\s*</div>\s*{/\* ── Kanan: Tabel Riwayat & Stats ── \*/})"

match = re.search(menunggu_pattern, content, re.DOTALL)
if match:
    menunggu_card = match.group(1)
    
    # Remove from left column
    content = content.replace(menunggu_card, "")
    
    # Insert it into right column, right after the Stats Row
    # We look for the closing div of the stats row:
    #             />
    #           </div>
    
    # But wait, it's safer to append it to the end of the lg:col-span-2 block before it closes.
    # The right column currently ends like:
    #             />
    #           </div>
    # 
    #         </div>
    #       </div>
    # 
    #       {/* ── Table Section ── */}
    
    # Let's insert it right after the Stats Row div.
    stats_row_end_pattern = r'(<KpiCard\s+title="Rata-rata Waktu".*?/>\s*</div>)'
    
    match2 = re.search(stats_row_end_pattern, content, re.DOTALL)
    if match2:
        content = content.replace(match2.group(1), match2.group(1) + menunggu_card)
        with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
            f.write(content)
        print("Success")
    else:
        print("Failed to find stats row")
else:
    print("Failed to find menunggu card")
