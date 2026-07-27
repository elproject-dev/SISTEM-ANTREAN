import re

with open('apps/sistem-antrean/src/pages/RegisterPage.tsx', 'r') as f:
    content = f.read()

# Define the block to remove exactly as it appears
start_marker = '<label className="text-xs font-semibold text-white/90 ml-1">Jenis Tugas</label>'
# We need to find the parent div of this label
div_start = content.rfind('<div className="space-y-1.5">', 0, content.find(start_marker))
div_end = content.find('</div>\n              </div>', div_start) + 28

if div_start != -1 and div_end != -1:
    content = content[:div_start] + content[div_end:]
    with open('apps/sistem-antrean/src/pages/RegisterPage.tsx', 'w') as f:
        f.write(content)
    print("Success removing role input")
else:
    print("Could not find role input block")
