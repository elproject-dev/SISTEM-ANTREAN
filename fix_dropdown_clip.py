import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# 1. Remove overflow-hidden from card
target_card = 'className="bg-amber-50/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-500/10 border border-orange-200/60 overflow-hidden"'
replacement_card = 'className="bg-amber-50/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-500/10 border border-orange-200/60"'

# 2. Add rounded-t-3xl to header
target_header = 'className="p-8 text-center bg-gradient-to-br from-orange-500 to-amber-500 border-b border-orange-600/50 text-white"'
replacement_header = 'className="p-8 text-center bg-gradient-to-br from-orange-500 to-amber-500 border-b border-orange-600/50 text-white rounded-t-3xl"'

content = content.replace(target_card, replacement_card)
content = content.replace(target_header, replacement_header)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success fixing overflow")
