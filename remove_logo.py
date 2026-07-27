import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

target = """          <div className="p-8 text-center bg-white/40 border-b border-white/40">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <Monitor size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Login Operator</h1>"""

replacement = """          <div className="p-8 text-center bg-white/40 border-b border-white/40">
            <h1 className="text-2xl font-black text-slate-800">Login Operator</h1>"""

content = content.replace(target, replacement)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success removing logo")
