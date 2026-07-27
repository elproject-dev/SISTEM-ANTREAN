import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = 'className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300"'
replacement = 'className="flex flex-col h-[calc(100vh-80px)] md:h-screen items-center justify-center p-4 w-full animate-in fade-in duration-300"'

content = content.replace(target, replacement)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success centering card")
