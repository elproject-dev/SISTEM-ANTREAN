import re

with open('apps/sistem-antrean/src/components/CustomButton.tsx', 'r') as f:
    content = f.read()

# We need to change the base text color logic because right now it's hardcoded to text-white in baseClass.
# Let's remove text-white from baseClass and add it to the variants where appropriate.
base_class = 'const baseClass = "px-6 py-[10px] text-white font-bold rounded-xl transition-all duration-150 active:translate-y-[4px] active:border-b-0 text-sm flex items-center justify-center gap-2 whitespace-nowrap border-b-4";'
new_base_class = 'const baseClass = "px-6 py-[10px] font-bold rounded-xl transition-all duration-150 active:translate-y-[4px] active:border-b-0 text-sm flex items-center justify-center gap-2 whitespace-nowrap border-b-4";'

content = content.replace(base_class, new_base_class)

# Update variants
old_primary = '"bg-orange-500 hover:bg-orange-400 border-orange-700 shadow-lg shadow-orange-500/20 active:shadow-none"'
new_primary = '"bg-orange-500 text-white hover:bg-orange-400 border-orange-700 shadow-lg shadow-orange-500/20 active:shadow-none"'

old_slate = '"bg-slate-700 hover:bg-slate-600 border-slate-900 shadow-lg shadow-slate-700/20 active:shadow-none"'
# Lighter, high-contrast slate variant for "Batal"
new_slate = '"bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300 shadow-lg shadow-slate-200/50 active:shadow-none"'

old_success = '"bg-emerald-500 hover:bg-emerald-400 border-emerald-700 shadow-lg shadow-emerald-500/20 active:shadow-none"'
new_success = '"bg-emerald-500 text-white hover:bg-emerald-400 border-emerald-700 shadow-lg shadow-emerald-500/20 active:shadow-none"'

old_error = '"bg-rose-500 hover:bg-rose-400 border-rose-700 shadow-lg shadow-rose-500/20 active:shadow-none"'
new_error = '"bg-rose-500 text-white hover:bg-rose-400 border-rose-700 shadow-lg shadow-rose-500/20 active:shadow-none"'

content = content.replace(old_primary, new_primary)
content = content.replace(old_slate, new_slate)
content = content.replace(old_success, new_success)
content = content.replace(old_error, new_error)

with open('apps/sistem-antrean/src/components/CustomButton.tsx', 'w') as f:
    f.write(content)

print("Success updating contrast")
