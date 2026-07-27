import re

with open('apps/sistem-antrean/src/components/CustomButton.tsx', 'r') as f:
    content = f.read()

# Change from slate-500 to slate-600
old_slate = '"bg-slate-500 text-white hover:bg-slate-400 border-slate-700 shadow-lg shadow-slate-500/20 active:shadow-none"'
new_slate = '"bg-slate-600 text-white hover:bg-slate-500 border-slate-800 shadow-lg shadow-slate-600/20 active:shadow-none"'

content = content.replace(old_slate, new_slate)

with open('apps/sistem-antrean/src/components/CustomButton.tsx', 'w') as f:
    f.write(content)

print("Success making slate button slightly darker")
