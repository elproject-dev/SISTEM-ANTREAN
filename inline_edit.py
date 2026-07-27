import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

# 1. We need to remove the <Dialog> block at the end and replace it with nothing
start_dialog = "<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>"
end_dialog = "</Dialog>"

start_idx = content.find(start_dialog)
end_idx = content.find(end_dialog) + len(end_dialog)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]

# 2. We will insert the new inline form right above the table container
# Specifically, before: <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
inline_form = """
      {isEditOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Data Staff
            </h2>
          </div>
          <form onSubmit={handleEditSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">No. WhatsApp</label>
                <Input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Jenis Tugas</label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as StaffRole)}>
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 font-bold text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg border-slate-200 font-bold">
                    <SelectItem value="operator">Operator (Loket)</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Status Akun</label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as StaffStatus)}>
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 font-bold text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-lg border-slate-200 font-bold">
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-3">
                <CustomButton
                  type="button"
                  variant="slate"
                  className="flex-1 h-11"
                  onClick={() => setIsEditOpen(false)}
                >
                  Batal
                </CustomButton>
                <CustomButton
                  type="submit"
                  variant="primary"
                  className="flex-1 h-11"
                >
                  Simpan
                </CustomButton>
              </div>
            </div>
          </form>
        </div>
      )}
"""

target_table_container = '<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">'

content = content.replace(target_table_container, inline_form + "\n      " + target_table_container)

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success converting to inline form")
