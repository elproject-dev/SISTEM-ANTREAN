import { useState } from 'react';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { useQueue } from '../hooks/useQueue';
import { CustomStatusBadge, type BadgeVariant } from '../components/CustomStatusBadge';
import { CustomNotification } from '../components/CustomNotification';
import { Users, Edit2 } from 'lucide-react';
import { CustomButton } from '../components/CustomButton';
import { ActionIconButton } from '../components/ActionIconButton';
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@elproject/ui';
import type { StaffRole, StaffStatus } from '../types/queue';

export function StaffPage() {
  const { state, updateStaff, deleteStaff } = useQueue();
  const { staffUsers = [] } = state;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<StaffRole>('operator');
  const [editStatus, setEditStatus] = useState<StaffStatus>('active');

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus staff ${name}?`)) {
      await deleteStaff(id);
      showNotification(`Staff ${name} berhasil dihapus!`);
    }
  };

  const openEditModal = (staff: any) => {
    setEditId(staff.id);
    setEditName(staff.name);
    setEditEmail(staff.email);
    setEditPhone(staff.phone);
    setEditRole(staff.role);
    setEditStatus(staff.status);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStaff(editId, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
      status: editStatus,
    });
    setIsEditOpen(false);
    showNotification('Data staff berhasil diperbarui!');
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Aktif', variant: 'success' as BadgeVariant };
      case 'pending': return { label: 'Menunggu', variant: 'warning' as BadgeVariant };
      case 'inactive': return { label: 'Tidak Aktif', variant: 'slate' as BadgeVariant };
      default: return { label: status, variant: 'slate' as BadgeVariant };
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'operator': return 'Operator (Loket)';
      default: return role;
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 p-4 sm:p-6 md:p-8 relative">
      <PageHeaderCard
        title="Manajemen Staff"
        subtitle="Kelola data staff dan pengguna sistem"
        showProfile={false}
      />
      
      {notification && (
        <CustomNotification type={notification.type} message={notification.message} />
      )}


      {isEditOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Data Staff
            </h2>
          </div>
          <form onSubmit={handleEditSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">No. WhatsApp</label>
                <Input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
            
              <div className="md:col-span-2 space-y-1.5">
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
              <div className="md:col-span-2 space-y-1.5">
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
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-semibold text-transparent select-none" aria-hidden="true">Aksi</label>
                <div className="flex gap-3 h-11">
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
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Daftar Staff
            </h2>

          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-bold border border-slate-200 w-12 text-center">NO</th>
                <th className="px-4 py-3 font-bold border border-slate-200 w-1/5">NAMA</th>
                <th className="px-4 py-3 font-bold border border-slate-200 w-1/5">EMAIL</th>
                <th className="px-4 py-3 font-bold border border-slate-200 w-1/6">NO. TELP</th>
                <th className="px-4 py-3 font-bold border border-slate-200 w-1/6">PERAN</th>
                <th className="px-4 py-3 font-bold border border-slate-200 w-1/6 text-center">STATUS</th>
                <th className="px-4 py-3 font-bold border border-slate-200 text-center min-w-[200px] w-[220px]">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {staffUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 border border-slate-200">
                    <p className="font-bold text-lg text-slate-600 mb-1">Tidak ada data</p>
                    <p className="text-sm">Belum ada data staff yang terdaftar.</p>
                  </td>
                </tr>
              ) : (
                staffUsers.map((staff, index) => {
                  const statusInfo = getStatusInfo(staff.status);
                  return (
                    <tr key={staff.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 border border-slate-200 text-center text-sm font-semibold text-slate-600">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 border border-slate-200">
                        <div className="font-bold text-slate-800 text-sm">{staff.name}</div>
                      </td>
                      <td className="px-4 py-3 border border-slate-200">
                        <div className="text-sm font-medium text-slate-600">{staff.email}</div>
                      </td>
                      <td className="px-4 py-3 border border-slate-200">
                        <div className="text-sm font-medium text-slate-600">{staff.phone}</div>
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-sm font-medium text-slate-700">
                        {getRoleLabel(staff.role)}
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <CustomStatusBadge variant={statusInfo.variant} label={statusInfo.label} />
                      </td>
                      <td className="px-4 py-3 border border-slate-200 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-nowrap">



                          <ActionIconButton
                            actionType="edit"
                            title="Edit Staff"
                            onClick={() => openEditModal(staff)}
                          />
                          <ActionIconButton
                            actionType="delete"
                            title="Hapus Staff"
                            onClick={() => handleDelete(staff.id, staff.name)}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
