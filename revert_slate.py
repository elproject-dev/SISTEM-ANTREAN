import re

with open('apps/sistem-antrean/src/components/CustomButton.tsx', 'r') as f:
    content = f.read()

# Change the slate variant to be lighter than the original 700 but still slate + white text
old_slate = '"bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300 shadow-lg shadow-slate-200/50 active:shadow-none"'
new_slate = '"bg-slate-500 text-white hover:bg-slate-400 border-slate-700 shadow-lg shadow-slate-500/20 active:shadow-none"'

content = content.replace(old_slate, new_slate)

with open('apps/sistem-antrean/src/components/CustomButton.tsx', 'w') as f:
    f.write(content)

print("Success making slate button lighter")
