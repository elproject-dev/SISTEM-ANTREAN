import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

# 1. Update destructuring from useQueue
content = content.replace("const { state, updateStaff } = useQueue();", "const { state, updateStaff, deleteStaff } = useQueue();")

# 2. Add notification state and helper after editStatus
state_old = "  const [editStatus, setEditStatus] = useState<StaffStatus>('active');"
state_new = """  const [editStatus, setEditStatus] = useState<StaffStatus>('active');

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus staff ${name}?`)) {
      deleteStaff(id);
      showNotification(`Staff ${name} berhasil dihapus!`);
    }
  };"""
content = content.replace(state_old, state_new)

# 3. Update handleEditSubmit to show notification
submit_old = """  const handleEditSubmit = (e: React.FormEvent) => {
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
submit_new = """  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStaff(editId, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
      status: editStatus,
    });
    setIsEditOpen(false);
    showNotification('Data staff berhasil diperbarui!');
  };"""
content = content.replace(submit_old, submit_new)

# 4. Render notification at the top inside main div
render_old = '    <div className="w-full space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 md:p-8">'
render_new = """    <div className="w-full space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 md:p-8 relative">
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-bold text-white shadow-xl flex items-center gap-2 animate-in slide-in-from-top-10 fade-in duration-300 ${notification.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
          {notification.message}
        </div>
      )}"""
content = content.replace(render_old, render_new)

# 5. Update delete button click handler
btn_old = "onClick={() => alert('Fitur Hapus (Segera Hadir)')}"
btn_new = "onClick={() => handleDelete(staff.id, staff.name)}"
content = content.replace(btn_old, btn_new)

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success adding notifications and delete logic")
