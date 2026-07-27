import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# Add min-h-[460px] to the card container
content = content.replace(
    '<div className={`bg-white rounded-2xl border-2 h-full flex flex-col overflow-hidden transition-all duration-300',
    '<div className={`bg-white rounded-2xl border-2 h-full min-h-[460px] flex flex-col overflow-hidden transition-all duration-300'
)

# Decrease font size of the ticket number from 7xl/8xl to 6xl/7xl
content = content.replace(
    '<div className="text-7xl md:text-8xl font-black text-primary tracking-tighter">',
    '<div className="text-6xl md:text-7xl font-black text-primary tracking-tighter truncate px-4">'
)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success fix card height")
