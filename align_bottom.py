import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# 1. Left column fixes
content = content.replace(
    '<div className="lg:col-span-1 space-y-6">',
    '<div className="lg:col-span-1 h-full">'
)

content = re.sub(
    r'(<div className={`bg-white rounded-2xl border-2) (overflow-hidden transition-all duration-300)',
    r'\1 h-full flex flex-col \2',
    content,
    count=1
)

content = content.replace(
    '<div className="p-8 text-center">',
    '<div className="p-8 text-center flex-1 flex flex-col justify-center">'
)

# 2. Right column fixes
content = content.replace(
    '<div className="lg:col-span-2 space-y-6">',
    '<div className="lg:col-span-2 flex flex-col space-y-6">'
)

content = content.replace(
    '<div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden mt-6">',
    '<div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">'
)

content = content.replace(
    '<div className="p-4 flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar">',
    '<div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">'
)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success alignment")
