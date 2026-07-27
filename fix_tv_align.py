import re

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'r') as f:
    content = f.read()

# 1. Update main layout grid
old_main = '<main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 px-8 pb-8 relative z-10">'
new_main = '<main className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-6 px-8 pb-8 relative z-10 items-stretch">'
content = content.replace(old_main, new_main)

# 2. Update Left section wrapper
old_left = '<div className="lg:col-span-8 flex flex-col justify-center items-start pl-8 lg:pl-16 relative">'
new_left = '<div className="lg:col-span-4 flex flex-col justify-center items-stretch relative h-full">'
content = content.replace(old_left, new_left)

# 3. Update the latestCall card styles to stretch and center
old_card = "            <div className={`flex flex-col items-start bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 pr-24 shadow-2xl transition-all duration-500 ${flash ? 'scale-105 bg-primary/20 border-primary/50 shadow-primary/30' : ''}`}>"
new_card = "            <div className={`flex flex-col items-center text-center justify-center w-full h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 shadow-2xl transition-all duration-500 ${flash ? 'scale-105 bg-primary/20 border-primary/50 shadow-primary/30' : ''}`}>"
content = content.replace(old_card, new_card)

# Update the fallback else block
old_else_card = """          ) : (
            <div className="flex flex-col items-start opacity-50 bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-12">"""
new_else_card = """          ) : (
            <div className="flex flex-col items-center justify-center text-center w-full h-full opacity-50 bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-12">"""
content = content.replace(old_else_card, new_else_card)

# Also fix the text flex alignment inside the latestCall card
old_text_flex = """              <div className="flex flex-col mb-4">
                <span className={`text-[12rem] lg:text-[15rem] font-black leading-none tracking-tighter drop-shadow-2xl ${flash ? 'text-white' : 'text-primary'}`}>
                  {latestCall.displayNumber}
                </span>
                <span className="text-3xl font-black tracking-widest text-white/70 uppercase ml-3 mt-2">
                  {state.services.find((s) => s.code === latestCall.serviceCode)?.name}
                </span>
              </div>"""
new_text_flex = """              <div className="flex flex-col items-center mb-8">
                <span className={`text-[14rem] font-black leading-none tracking-tighter drop-shadow-2xl ${flash ? 'text-white' : 'text-primary'}`}>
                  {latestCall.displayNumber}
                </span>
                <span className="text-4xl font-black tracking-widest text-white/70 uppercase mt-4">
                  {state.services.find((s) => s.code === latestCall.serviceCode)?.name}
                </span>
              </div>"""
content = content.replace(old_text_flex, new_text_flex)

old_text_else = """              <div className="flex flex-col items-start gap-4 mt-2">
                <div className="text-[12rem] font-black text-white leading-none">—</div>
                <p className="text-2xl font-bold tracking-wider text-white uppercase">Menunggu Panggilan...</p>
              </div>"""
new_text_else = """              <div className="flex flex-col items-center gap-4 mt-2">
                <div className="text-[14rem] font-black text-white leading-none">—</div>
                <p className="text-3xl font-bold tracking-wider text-white uppercase">Menunggu Panggilan...</p>
              </div>"""
content = content.replace(old_text_else, new_text_else)


# 4. Right side stats & status list
old_right = '<div className="lg:col-span-4 flex flex-col gap-6 pt-4">'
new_right = '<div className="lg:col-span-2 flex flex-col gap-6 h-full">'
content = content.replace(old_right, new_right)

with open('apps/sistem-antrean/src/pages/TVPage.tsx', 'w') as f:
    f.write(content)

print("Alignment fixed.")
