import re

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'r') as f:
    content = f.read()

old_block = """          <div className="mb-6">
            <span className="inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-bold text-white uppercase tracking-widest border border-white/20 shadow-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_8px_rgba(249,115,22,1)]" />
              </span>
              Panggilan Saat Ini
            </span>
          </div>

          {latestCall ? (
            <div className={`flex flex-col items-start bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 pr-24 shadow-2xl transition-all duration-500 ${flash ? 'scale-105 bg-primary/20 border-primary/50 shadow-primary/30' : ''}`}>"""

new_block = """          {latestCall ? (
            <div className={`flex flex-col items-start bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 pr-24 shadow-2xl transition-all duration-500 ${flash ? 'scale-105 bg-primary/20 border-primary/50 shadow-primary/30' : ''}`}>
              <div className="mb-6">
                <span className="inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-bold text-white uppercase tracking-widest border border-white/20 shadow-lg">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_8px_rgba(249,115,22,1)]" />
                  </span>
                  Panggilan Saat Ini
                </span>
              </div>"""

content = content.replace(old_block, new_block)

old_else = """          ) : (
            <div className="flex flex-col items-start gap-4 opacity-50 bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-12">
              <div className="text-[12rem] font-black text-white leading-none">—</div>
              <p className="text-2xl font-bold tracking-wider text-white uppercase">Menunggu Panggilan...</p>
            </div>
          )}"""

new_else = """          ) : (
            <div className="flex flex-col items-start opacity-50 bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-12">
              <div className="mb-6">
                <span className="inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-bold text-white uppercase tracking-widest border border-white/20 shadow-lg">
                  <span className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white/30" />
                  </span>
                  Panggilan Saat Ini
                </span>
              </div>
              <div className="flex flex-col items-start gap-4 mt-2">
                <div className="text-[12rem] font-black text-white leading-none">—</div>
                <p className="text-2xl font-bold tracking-wider text-white uppercase">Menunggu Panggilan...</p>
              </div>
            </div>
          )}"""

content = content.replace(old_else, new_else)

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Card merged successfully.")
