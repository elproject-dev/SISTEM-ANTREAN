import re

with open('apps/sistem-antrean/src/components/CustomButton.tsx', 'r') as f:
    content = f.read()

# We will replace the baseClass and variantClass blocks.
# Using border-b-4 for the 3D effect.
# py-2 is 0.5rem (8px top, 8px bottom = 16px). Line height text-sm is 20px. 16+20 = 36px. +4px border = 40px.
# py-2.5 is 0.625rem (10px top, 10px bottom = 20px). + 20px text + 4px border = 44px.

new_button_logic = """  const baseClass = "px-6 py-[10px] text-white font-bold rounded-xl transition-all duration-150 active:translate-y-[4px] active:border-b-0 text-sm flex items-center justify-center gap-2 whitespace-nowrap border-b-4";

  let variantClass = "";
  if (variant === 'primary') {
    variantClass = "bg-orange-500 hover:bg-orange-400 border-orange-700 shadow-lg shadow-orange-500/20 active:shadow-none";
  } else if (variant === 'slate') {
    variantClass = "bg-slate-700 hover:bg-slate-600 border-slate-900 shadow-lg shadow-slate-700/20 active:shadow-none";
  } else if (variant === 'success') {
    variantClass = "bg-emerald-500 hover:bg-emerald-400 border-emerald-700 shadow-lg shadow-emerald-500/20 active:shadow-none";
  } else if (variant === 'error') {
    variantClass = "bg-rose-500 hover:bg-rose-400 border-rose-700 shadow-lg shadow-rose-500/20 active:shadow-none";
  }"""

# Replace in file
# Find the start of baseClass and end of the if-else block
start_idx = content.find('const baseClass =')
end_idx = content.find('return (')

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_button_logic + "\n\n  " + content[end_idx:]
    with open('apps/sistem-antrean/src/components/CustomButton.tsx', 'w') as f:
        f.write(content)
    print("Success updating CustomButton")
else:
    print("Could not find replacement block")
