import re

with open('apps/sistem-antrean/src/pages/AntreanPage.tsx', 'r') as f:
    content = f.read()

# 1. Update lucide imports
content = content.replace(
    "import { Plus, Search, Monitor, CheckCircle2, ListChecks, Activity, Clock, Users } from 'lucide-react';",
    "import { Plus, Search, Monitor, CheckCircle2, ListChecks, Activity, Clock, Users, ChevronUp, ChevronDown } from 'lucide-react';"
)

# 2. Add state
old_state = "const [searchQuery, setSearchQuery] = useState('');"
new_state = """const [searchQuery, setSearchQuery] = useState('');
  const [showLoketCards, setShowLoketCards] = useState(false);"""
content = content.replace(old_state, new_state)

# 3. Wrap Loket Status in condition and add toggle button to table header
old_jsx = """      {/* ── Loket Status ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map(loket => {"""

new_jsx = """      {/* ── Loket Status ── */}
      {showLoketCards && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {[1, 2, 3, 4, 5].map(loket => {"""
content = content.replace(old_jsx, new_jsx)

old_jsx_end = """              </div>
           );
        })}
      </div>

      {/* ── Table Section ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-row items-center justify-between bg-white gap-3">
          <div className="flex items-center space-x-2 truncate">
            <ListChecks size={20} className="text-slate-600 shrink-0" />
            <h2 className="font-bold text-slate-800 text-lg">Semua Data Antrean ({filteredTickets.length})</h2>
          </div>
        </div>"""

new_jsx_end = """              </div>
           );
        })}
        </div>
      )}

      {/* ── Table Section ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-row items-center justify-between bg-white gap-3">
          <div className="flex items-center space-x-2 truncate">
            <ListChecks size={20} className="text-slate-600 shrink-0" />
            <h2 className="font-bold text-slate-800 text-lg">Semua Data Antrean ({filteredTickets.length})</h2>
          </div>
          <CustomButton 
            variant="slate" 
            onClick={() => setShowLoketCards(!showLoketCards)} 
            className="text-xs h-8 px-3"
          >
            {showLoketCards ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span className="hidden sm:inline ml-1">{showLoketCards ? 'Sembunyikan Status Loket' : 'Tampilkan Status Loket'}</span>
          </CustomButton>
        </div>"""
content = content.replace(old_jsx_end, new_jsx_end)

with open('apps/sistem-antrean/src/pages/AntreanPage.tsx', 'w') as f:
    f.write(content)

print("Updated AntreanPage with collapsible loket cards")
