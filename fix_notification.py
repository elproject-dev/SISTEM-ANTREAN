import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

render_old = '    <div className="w-full space-y-6 animate-in fade-in duration-300 p-4 sm:p-6 md:p-8">'
render_new = """    <div className="w-full space-y-6 animate-in fade-in duration-300 p-4 sm:p-6 md:p-8 relative">
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-bold text-white shadow-xl flex items-center gap-2 animate-in slide-in-from-top-10 fade-in duration-300 ${notification.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
          {notification.message}
        </div>
      )}"""

content = content.replace(render_old, render_new)

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success fixing notification render")
