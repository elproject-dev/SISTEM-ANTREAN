import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# Change min-height
content = content.replace(
    'min-h-[460px]',
    'min-h-[380px]'
)

# Reduce padding from p-8 to p-6
content = content.replace(
    '<div className="p-8 text-center flex-1 flex flex-col justify-center">',
    '<div className="p-6 text-center flex-1 flex flex-col justify-center">'
)

# Reduce gap from space-y-6 to space-y-4
content = content.replace(
    '<div className={`space-y-6 ${recallAnim ? \'animate-pulse\' : \'\'}`}>',
    '<div className={`space-y-4 ${recallAnim ? \'animate-pulse\' : \'\'}`}>'
)

# Also reduce the padding of the buttons section at the bottom (optional, but helps keep it tight)
# It currently has: <div className="grid grid-cols-3 gap-1 p-2 bg-slate-50">
# And the buttons have `py-4 gap-2`. Let's reduce `py-4` to `py-3`.
content = content.replace(
    'className="flex flex-col items-center justify-center py-4 gap-2',
    'className="flex flex-col items-center justify-center py-3 gap-1'
)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success reducing height")
