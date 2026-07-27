import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# Make it better centered
content = content.replace(
    'className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-300"',
    'className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300"'
)

# Card container: change to orange theme
content = content.replace(
    'className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 overflow-hidden"',
    'className="bg-amber-50/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-500/10 border border-orange-200/60 overflow-hidden"'
)

# Header: change to solid orange gradient
content = content.replace(
    'className="p-8 text-center bg-white/40 border-b border-white/40"',
    'className="p-8 text-center bg-gradient-to-br from-orange-500 to-amber-500 border-b border-orange-600/50 text-white"'
)
content = content.replace(
    '<h1 className="text-2xl font-black text-slate-800">Login Operator</h1>\n            <p className="text-sm text-slate-500 font-medium mt-1">Sistem Antrean Terpadu</p>',
    '<h1 className="text-2xl font-black">Login Operator</h1>\n            <p className="text-sm font-medium mt-1 text-white/90">Sistem Antrean Terpadu</p>'
)

# Replace input backgrounds to be pure white for contrast against the amber-50 card
content = content.replace('bg-white/60', 'bg-white')
content = content.replace('border-white/60', 'border-slate-200')

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success styling login card")
