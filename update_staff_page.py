import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
imports = """import { useState } from 'react';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { useQueue } from '../hooks/useQueue';
import { CustomStatusBadge, type BadgeVariant } from '../components/CustomStatusBadge';
import { Users, CheckCircle, Clock, Edit2 } from 'lucide-react';
import { CustomButton } from '../components/CustomButton';
import { ActionIconButton } from '../components/ActionIconButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@elproject/ui';
import type { StaffRole, StaffStatus } from '../types/queue';
"""

# Replace the top imports block
# Find the start of `export function StaffPage`
export_idx = content.find("export function StaffPage")
content = imports + "\n" + content[export_idx:]


# 2. Update hooks and state
state_block = """  const { state, updateStaffStatus, updateStaff } = useQueue();
  const { staffUsers = [] } = state;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<StaffRole>('operator');
  const [editStatus, setEditStatus] = useState<StaffStatus>('active');

  const openEditModal = (staff: any) => {
    setEditId(staff.id);
    setEditName(staff.name);
    setEditEmail(staff.email);
    setEditPhone(staff.phone);
    setEditRole(staff.role);
    setEditStatus(staff.status);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStaff(editId, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
      status: editStatus,
    });
    setIsEditOpen(false);
  };"""

# Replace the old useQueue destructuring
old_hook = """  const { state, updateStaffStatus } = useQueue();
  const { staffUsers = [] } = state;"""
content = content.replace(old_hook, state_block)

# 3. Connect edit button
old_edit_btn = "onClick={() => alert('Fitur Edit (Segera Hadir)')}"
new_edit_btn = "onClick={() => openEditModal(staff)}"
content = content.replace(old_edit_btn, new_edit_btn, 1)

# 4. Add Dialog block at the end (before last </div>)
dialog_block = """
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-3xl border-0 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Data Staff
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
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
            
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="pt-4 flex gap-3">
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
                Simpan Perubahan
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"""

# Replace the last `    </div>\n  );\n}` with the new dialog_block
last_div_idx = content.rfind("    </div>\n  );\n}")
if last_div_idx != -1:
    content = content[:last_div_idx] + dialog_block

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success updating StaffPage")
