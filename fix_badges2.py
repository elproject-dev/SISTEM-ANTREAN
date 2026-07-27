import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# Replace the specific lines safely using regex

content = re.sub(
    r"\{currentTicket\.type === 'priority' \? '⭐ PRIORITAS' : currentTicket\.type === 'online' \? '🌐 ONLINE' : '📄 OFFLINE'\}",
    "{currentTicket.type === 'priority' ? 'PRIORITAS' : currentTicket.type === 'online' ? 'ONLINE' : 'OFFLINE'}",
    content
)

content = re.sub(
    r"'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'",
    "'bg-slate-500 hover:bg-slate-600 text-white border-0 shadow-sm'",
    content
)

content = re.sub(
    r"<Badge variant=\"secondary\" className=\"font-bold text-xs\">\s*\{SERVICES\.find\(\(s\) => s\.code === currentTicket\.serviceCode\)\?\.name\}\s*</Badge>",
    "",
    content
)

content = re.sub(
    r"\{currentTicket\.customerName \?\s*\(\s*<p className=\"text-lg text-slate-800 font-bold\">\{currentTicket\.customerName\}</p>\s*\)\s*:\s*\(\s*<p className=\"text-sm\">Pelanggan Umum</p>\s*\)\}",
    """<p className="text-lg text-slate-800 font-bold">
                      {currentTicket.customerName || 'Pelanggan Umum'}
                    </p>
                    <p className="text-xs font-bold text-primary mt-1 uppercase tracking-wider">
                      {SERVICES.find((s) => s.code === currentTicket.serviceCode)?.name}
                    </p>""",
    content
)


with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success fix type badge 2")
