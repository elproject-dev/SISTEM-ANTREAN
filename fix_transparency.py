import re

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'r') as f:
    content = f.read()

# Make white backgrounds more transparent (80% -> 40%, 90% -> 50%)
content = content.replace('bg-white/80', 'bg-white/40')
content = content.replace('bg-white/90', 'bg-white/50')
content = content.replace('bg-slate-100/60', 'bg-white/30')
content = content.replace('bg-white/60', 'bg-white/40')

# Overlay transparency (make it slightly less obscuring)
content = content.replace('bg-white/50 backdrop-blur-[2px]', 'bg-white/20 backdrop-blur-[4px]')

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Transparency updated.")
