import { useState } from 'react';
import { useQueue } from '../hooks/useQueue';
import { ListChecks, Plus, Settings, RotateCcw, Edit, Search, MonitorPlay, Volume2, Palette, Globe, Database, Power, ChevronDown, ChevronUp } from 'lucide-react';
import type { ServiceType, RunningTextItem } from '../types/queue';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { CustomButton } from '../components/CustomButton';
import { CustomNotification } from '../components/CustomNotification';
import { CustomStatusBadge } from '../components/CustomStatusBadge';
import { ActionIconButton } from '../components/ActionIconButton';

export function SettingsPage() {
  const { state, addService, updateService, deleteService, resetCounter, addRunningText, updateRunningText, deleteRunningText } = useQueue();

  const [activeMenu, setActiveMenu] = useState<'services' | 'runningText'>('services');
  const [showForm, setShowForm] = useState(false);
  const [showServicesTable, setShowServicesTable] = useState(false);
  const [showRtTable, setShowRtTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCode, setEditingCode] = useState<string | null>(null);

  // Form State Layanan
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Form State Running Text
  const [rtText, setRtText] = useState('');
  const [editingRtId, setEditingRtId] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState('');

  const resetForm = () => {
    setCode('');
    setName('');
    setDescription('');
    setEditingCode(null);
  };

  const resetRtForm = () => {
    setRtText('');
    setEditingRtId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const upperCode = code.trim().toUpperCase();

    if (editingCode) {
      await updateService(editingCode, { code: upperCode, name, description });
      setShowSuccess(`Layanan ${name} berhasil diperbarui.`);
    } else {
      // Check if code already exists
      if (state.services.some(s => s.code === upperCode)) {
        alert('Kode layanan sudah ada! Gunakan kode lain.');
        return;
      }
      await addService({ code: upperCode, name, description });
      setShowSuccess(`Layanan ${name} berhasil ditambahkan.`);
    }

    resetForm();
    setShowForm(false);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const handleEdit = (service: ServiceType) => {
    setEditingCode(service.code);
    setCode(service.code);
    setName(service.name);
    setDescription(service.description || '');
    setShowForm(true);
  };

  const handleDelete = async (code: string, name: string) => {
    if (confirm(`Yakin ingin menghapus kategori layanan: ${name}?`)) {
      await deleteService(code);
      setShowSuccess(`Kategori ${name} dihapus.`);
      setTimeout(() => setShowSuccess(''), 3000);
    }
  };

  const handleResetCounter = async (code: string, name: string) => {
    if (confirm(`Yakin ingin mereset ulang nomor antrean untuk ${name} kembali ke 0?`)) {
      await resetCounter(code);
      setShowSuccess(`Nomor antrean ${name} telah direset.`);
      setTimeout(() => setShowSuccess(''), 3000);
    }
  };

  const handleRtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtText.trim()) return;

    if (editingRtId) {
      const current = state.runningTexts?.find(rt => rt.id === editingRtId);
      await updateRunningText(editingRtId, rtText, current?.isActive ?? true);
      setShowSuccess(`Running text berhasil diperbarui.`);
    } else {
      await addRunningText(rtText);
      setShowSuccess(`Running text berhasil ditambahkan.`);
    }

    resetRtForm();
    setShowForm(false);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const handleEditRt = (rt: RunningTextItem) => {
    setEditingRtId(rt.id);
    setRtText(rt.text);
    setShowForm(true);
  };

  const handleDeleteRt = async (id: string, text: string) => {
    if (confirm(`Yakin ingin menghapus running text ini?\n"${text}"`)) {
      await deleteRunningText(id);
      setShowSuccess(`Running text dihapus.`);
      setTimeout(() => setShowSuccess(''), 3000);
    }
  };

  const handleToggleRt = async (id: string, text: string, currentActive: boolean) => {
    await updateRunningText(id, text, !currentActive);
    setShowSuccess(`Running text ${!currentActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const filteredServices = state.services.filter(s => {
    const search = searchQuery.toLowerCase();
    return s.code.toLowerCase().includes(search) ||
      s.name.toLowerCase().includes(search) ||
      (s.description || '').toLowerCase().includes(search);
  });

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 md:p-8">
      {/* ── Header ── */}
      <PageHeaderCard
        title={<><Settings className="text-primary h-6 w-6 sm:h-8 sm:w-8" /> Pengaturan Sistem</>}
        subtitle="Kelola kategori layanan dan nomor urut antrean"
        showProfile={false}
      >
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 mr-2">
          <div className="relative w-full sm:w-64 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-4 pl-10 text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm font-medium text-sm h-[44px]"
            />
          </div>
          <CustomButton
            variant={showForm && !editingCode && !editingRtId ? 'slate' : 'primary'}
            onClick={() => {
              if (showForm && !editingCode && !editingRtId) {
                setShowForm(false);
              } else {
                if (activeMenu === 'services') resetForm();
                else resetRtForm();
                setShowForm(true);
              }
            }}
            className="w-full sm:w-auto"
          >
            {showForm && !editingCode && !editingRtId ? 'Tutup Form' : <><Plus size={18} /> <span>{activeMenu === 'services' ? 'Tambah Kategori' : 'Tambah Teks'}</span></>}
          </CustomButton>
        </div>
      </PageHeaderCard>

      {showSuccess && (
        <CustomNotification type="success" message={showSuccess} />
      )}

      {/* ── Menu Pengaturan Lainnya ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <button
          className={`aspect-square rounded-2xl shadow-sm border p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-1 group ${activeMenu === 'services' ? 'bg-primary/5 border-primary/30' : 'bg-white border-slate-200'}`}
          onClick={() => {
            if (activeMenu === 'services' && showForm && !editingCode) {
              setShowForm(false);
            } else {
              setActiveMenu('services');
              resetForm();
              setShowForm(true);
            }
          }}
        >
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <ListChecks size={28} />
          </div>
          <span className={`font-bold text-sm text-center transition-colors leading-tight ${activeMenu === 'services' ? 'text-primary' : 'text-slate-700 group-hover:text-primary'}`}>
            Kategori Layanan
          </span>
        </button>

        <button
          className={`aspect-square rounded-2xl shadow-sm border p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-1 group ${activeMenu === 'runningText' ? 'bg-primary/5 border-primary/30' : 'bg-white border-slate-200'}`}
          onClick={() => {
            if (activeMenu === 'runningText' && showForm && !editingRtId) {
              setShowForm(false);
            } else {
              setActiveMenu('runningText');
              resetRtForm();
              setShowForm(true);
            }
          }}
        >
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <MonitorPlay size={28} />
          </div>
          <span className={`font-bold text-sm text-center transition-colors leading-tight ${activeMenu === 'runningText' ? 'text-primary' : 'text-slate-700 group-hover:text-primary'}`}>
            Running Text TV
          </span>
        </button>

        <button
          className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-1 group"
          onClick={() => {
            // Aksi untuk membuka form/modal set up suara nantinya
            console.log('Buka Setting Suara');
          }}
        >
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Volume2 size={28} />
          </div>
          <span className="font-bold text-slate-700 text-sm text-center group-hover:text-primary transition-colors leading-tight">
            Set Up Suara
          </span>
        </button>

        <button
          className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-1 group"
          onClick={() => {
            // Aksi untuk membuka form/modal set up warna teks nantinya
            console.log('Buka Setting Warna Text');
          }}
        >
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Palette size={28} />
          </div>
          <span className="font-bold text-slate-700 text-sm text-center group-hover:text-primary transition-colors leading-tight">
            Warna Teks TV
          </span>
        </button>

        <button
          className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-1 group"
          onClick={() => {
            // Aksi untuk membuka form/modal konfigurasi web nantinya
            console.log('Buka Konfigurasi Web');
          }}
        >
          <div className="w-14 h-14 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Globe size={28} />
          </div>
          <span className="font-bold text-slate-700 text-sm text-center group-hover:text-primary transition-colors leading-tight">
            Konfigurasi Web
          </span>
        </button>

        <button
          className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-1 group"
          onClick={() => {
            // Aksi untuk membuka form/modal backup dan reset nantinya
            console.log('Buka Backup & Reset');
          }}
        >
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Database size={28} />
          </div>
          <span className="font-bold text-slate-700 text-sm text-center group-hover:text-primary transition-colors leading-tight">
            Backup & Reset
          </span>
        </button>
      </div>

      {/* ── Form Tambah/Edit Kategori ── */}
      {showForm && activeMenu === 'services' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            {editingCode ? <Edit size={20} className="text-amber-500" /> : <Plus size={20} className="text-primary" />}
            {editingCode ? 'Edit Kategori Layanan' : 'Tambah Kategori Baru'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">ID <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Misal: A, B, THT, GIGI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-sm font-bold uppercase focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  required
                />
                <p className="text-[10px] text-slate-500">ID ini akan menjadi awalan nomor tiket (Cth: A-001).</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Nama Layanan <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Poli Umum"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  required
                />
              </div>



              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Deskripsi <span className="text-slate-400 font-medium">(Opsional)</span></label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan singkat layanan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-2">
              {editingCode && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Batal
                </button>
              )}
              <CustomButton
                type="submit"
                variant={editingCode ? 'success' : 'primary'}
                className="w-full sm:w-auto"
              >
                {editingCode ? 'Simpan Perubahan' : <><Plus size={16} /> Tambah Layanan</>}
              </CustomButton>
            </div>
          </form>
        </div>
      )}

      {/* ── Form Tambah/Edit Running Text ── */}
      {showForm && activeMenu === 'runningText' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            {editingRtId ? <Edit size={20} className="text-amber-500" /> : <Plus size={20} className="text-primary" />}
            {editingRtId ? 'Edit Running Text' : 'Tambah Running Text Baru'}
          </h2>

          <form onSubmit={handleRtSubmit} className="flex flex-col gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Teks <span className="text-rose-500">*</span></label>
              <textarea
                value={rtText}
                onChange={(e) => setRtText(e.target.value)}
                placeholder="Masukkan teks yang akan berjalan di layar TV..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none h-24"
                required
              />
            </div>

            <div className="flex gap-3 justify-end mt-2">
              {editingRtId && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetRtForm();
                  }}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Batal
                </button>
              )}
              <CustomButton
                type="submit"
                variant={editingRtId ? 'success' : 'primary'}
                className="w-full sm:w-auto"
              >
                {editingRtId ? 'Simpan Perubahan' : <><Plus size={16} /> Tambah Teks</>}
              </CustomButton>
            </div>
          </form>
        </div>
      )}

      {/* ── Table Section ── */}
      {activeMenu === 'services' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div
            className="p-4 border-b border-slate-200 flex flex-row items-center justify-between bg-white gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setShowServicesTable(!showServicesTable)}
          >
            <div className="flex items-center space-x-2 truncate">
              <ListChecks size={20} className="text-slate-600 shrink-0" />
              <h2 className="font-bold text-slate-800 text-lg select-none">Semua Kategori Layanan ({filteredServices.length})</h2>
            </div>
            <div className="p-1 bg-slate-100 rounded-lg text-slate-500">
              {showServicesTable ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {showServicesTable && (
            <div className="overflow-x-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-bold border border-slate-200 w-12 text-center">NO</th>
                    <th className="px-4 py-3 font-bold border border-slate-200 w-24 text-center">ID</th>
                    <th className="px-4 py-3 font-bold border border-slate-200">LAYANAN</th>
                    <th className="px-4 py-3 font-bold border border-slate-200">DESKRIPSI</th>
                    <th className="px-4 py-3 font-bold border border-slate-200 text-center w-36">NO. SAAT INI</th>
                    <th className="px-4 py-3 font-bold border border-slate-200 text-center w-48">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500 border border-slate-200">
                        <p className="font-bold text-lg text-slate-600 mb-1">Belum ada kategori layanan</p>
                        <p className="text-sm">Klik "Tambah Kategori" untuk membuat layanan baru atau pencarian tidak ditemukan.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((service, index) => {
                      const currentNumber = state.counters[service.code] || 0;

                      return (
                        <tr key={service.code} className={`transition-colors hover:bg-slate-50 ${editingCode === service.code ? 'bg-blue-50/50' : ''}`}>
                          <td className="px-4 py-3 border border-slate-200 text-center text-sm font-medium text-slate-500">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 border border-slate-200 text-center">
                            <span className="font-black text-lg text-primary">{service.code}</span>
                          </td>
                          <td className="px-4 py-3 border border-slate-200">
                            <span className="font-bold text-slate-800 text-base">{service.name}</span>
                          </td>
                          <td className="px-4 py-3 border border-slate-200 text-sm font-medium text-slate-600">
                            {service.description || '-'}
                          </td>
                          <td className="px-4 py-3 border border-slate-200 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-xl font-black text-slate-700">{currentNumber}</span>
                              <button
                                onClick={() => handleResetCounter(service.code, service.name)}
                                className="text-[10px] uppercase font-bold tracking-wider text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                title="Reset Nomor ke 0"
                              >
                                <RotateCcw size={10} /> Reset
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 border border-slate-200 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <ActionIconButton
                                actionType="edit"
                                title="Edit"
                                onClick={() => handleEdit(service)}
                              />
                              <ActionIconButton
                                actionType="delete"
                                title="Hapus"
                                onClick={() => handleDelete(service.code, service.name)}
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
          )}
        </div>
      )}

      {/* ── Table Section Running Text ── */}
      {activeMenu === 'runningText' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div
            className="p-4 border-b border-slate-200 flex flex-row items-center justify-between bg-white gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setShowRtTable(!showRtTable)}
          >
            <div className="flex items-center space-x-2 truncate">
              <MonitorPlay size={20} className="text-slate-600 shrink-0" />
              <h2 className="font-bold text-slate-800 text-lg select-none">Semua Running Text ({state.runningTexts?.length || 0})</h2>
            </div>
            <div className="p-1 bg-slate-100 rounded-lg text-slate-500">
              {showRtTable ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {showRtTable && (
            <div className="overflow-x-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-bold border border-slate-200 w-12 text-center">NO</th>
                    <th className="px-4 py-3 font-bold border border-slate-200">TEKS</th>
                    <th className="px-4 py-3 font-bold border border-slate-200 text-center w-32">STATUS</th>
                    <th className="px-4 py-3 font-bold border border-slate-200 text-center w-48">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {(!state.runningTexts || state.runningTexts.length === 0) ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-500 border border-slate-200">
                        <p className="font-bold text-lg text-slate-600 mb-1">Belum ada running text</p>
                        <p className="text-sm">Klik "Tambah Teks" untuk membuat running text baru.</p>
                      </td>
                    </tr>
                  ) : (
                    state.runningTexts.map((rt, index) => (
                      <tr key={rt.id} className={`transition-colors hover:bg-slate-50 ${editingRtId === rt.id ? 'bg-orange-50/50' : ''} ${!rt.isActive ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3 border border-slate-200 text-center text-sm font-medium text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 border border-slate-200">
                          <span className="font-medium text-slate-800 text-base">{rt.text}</span>
                        </td>
                        <td className="px-4 py-3 border border-slate-200 text-center">
                          <CustomStatusBadge
                            variant={rt.isActive ? 'active' : 'inactive'}
                            label={rt.isActive ? 'Aktif' : 'Nonaktif'}
                            icon={<Power size={12} />}
                            onClick={() => handleToggleRt(rt.id, rt.text, rt.isActive)}
                          />
                        </td>
                        <td className="px-4 py-3 border border-slate-200 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <ActionIconButton
                              actionType="edit"
                              title="Edit"
                              onClick={() => handleEditRt(rt)}
                            />
                            <ActionIconButton
                              actionType="delete"
                              title="Hapus"
                              onClick={() => handleDeleteRt(rt.id, rt.text)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
