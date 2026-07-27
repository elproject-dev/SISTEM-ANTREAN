import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

# 1. Add import
import_stmt = "import { CustomStatusBadge, type BadgeVariant } from '../components/CustomStatusBadge';"
new_import = "import { CustomStatusBadge, type BadgeVariant } from '../components/CustomStatusBadge';\nimport { CustomNotification } from '../components/CustomNotification';"
content = content.replace(import_stmt, new_import)

# 2. Replace render
render_old = """      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-bold text-white shadow-xl flex items-center gap-2 animate-in slide-in-from-top-10 fade-in duration-300 ${notification.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
          {notification.message}
        </div>
      )}"""
render_new = """      {notification && (
        <CustomNotification type={notification.type} message={notification.message} />
      )}"""
content = content.replace(render_old, render_new)

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Replaced with CustomNotification")
