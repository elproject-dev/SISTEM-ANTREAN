import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

target = 'className="flex justify-center gap-1.5 flex-wrap"'
replacement = 'className="flex items-center justify-center gap-1.5 flex-wrap"'

content = content.replace(target, replacement)

# Let's also ensure CustomButtons in StaffPage have h-8 so they align perfectly
content = content.replace('className="py-1.5 px-3 text-xs"', 'className="h-8 py-1.5 px-3 text-xs"')
content = content.replace('className="py-1.5 px-3 text-xs opacity-80"', 'className="h-8 py-1.5 px-3 text-xs opacity-80"')

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success fixing alignment")
