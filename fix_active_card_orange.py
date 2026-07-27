import re

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'r') as f:
    content = f.read()

old_block = """              {/* Blok Angka Tiket */}
              <div className={`flex-1 flex items-center justify-center border rounded-b-3xl px-4 py-6 ${
                op && ct ? 'bg-white/90 border-white/50 backdrop-blur-xl' : 
                op ? 'bg-white/40 border-white/50 backdrop-blur-xl' : 
                'bg-white/20 border-white/30 backdrop-blur-sm opacity-60'
              }`}>
                {ct ? (
                  <span className="text-6xl font-black text-slate-900 leading-none drop-shadow-sm">{ct.displayNumber}</span>
                ) : (
                  <span className="text-5xl font-bold text-slate-500 leading-none">—</span>
                )}
              </div>"""

# Change the active (op && ct) card background to orange gradient and text to white
new_block = """              {/* Blok Angka Tiket */}
              <div className={`flex-1 flex items-center justify-center border rounded-b-3xl px-4 py-6 ${
                op && ct ? 'bg-gradient-to-br from-orange-400 to-orange-500 border-orange-400 shadow-inner' : 
                op ? 'bg-white/40 border-white/50 backdrop-blur-xl' : 
                'bg-white/20 border-white/30 backdrop-blur-sm opacity-60'
              }`}>
                {ct ? (
                  <span className={`text-6xl font-black leading-none drop-shadow-md ${op && ct ? 'text-white' : 'text-slate-900'}`}>{ct.displayNumber}</span>
                ) : (
                  <span className="text-5xl font-bold text-slate-500 leading-none">—</span>
                )}
              </div>"""

content = content.replace(old_block, new_block)

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Active ticket block is now orange")
