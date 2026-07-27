import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# We need to replace the entire OperatorLoginForm component.
# Let's find its start and end.
start_marker = "function OperatorLoginForm({ onLogin }:"
end_marker = "  );\n}\n\n// ─── Operator Dashboard"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    old_component = content[start_idx:end_idx]
    
    new_component = """function OperatorLoginForm({ onLogin }: { onLogin: (name: string, loket: number, services: ServiceCode[]) => void }) {
  const { state } = useQueue();
  const operatorStaff = state.staffUsers.filter(u => u.role === 'operator' && u.status === 'active');

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [loket, setLoket] = useState('1');
  const [services, setServices] = useState<ServiceCode[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const toggleService = (code: ServiceCode) =>
    setServices((p) => p.includes(code) ? p.filter((c) => c !== code) : [...p, code]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStaffId) {
      setError('Silakan pilih operator terlebih dahulu.');
      return;
    }
    if (services.length === 0) {
      setError('Silakan pilih minimal satu layanan.');
      return;
    }

    const staff = operatorStaff.find(u => u.id === selectedStaffId);
    if (!staff) {
      setError('Operator tidak valid.');
      return;
    }

    if (staff.password && staff.password !== password) {
      setError('Password salah.');
      return;
    }

    onLogin(staff.name, parseInt(loket), services);
  };

  // Tutup dropdown layanan saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.services-dropdown')) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 overflow-hidden">
          <div className="p-8 text-center bg-white/40 border-b border-white/40">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <Monitor size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Login Operator</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Sistem Antrean Terpadu</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                <XCircle size={18} /> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nama Operator</label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger className="w-full h-[48px] bg-white/60 border-white/60 text-sm rounded-xl font-medium focus:ring-4 focus:ring-primary/10">
                  <SelectValue placeholder="Pilih operator..." />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-lg border-slate-200 rounded-xl">
                  {operatorStaff.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500 text-center">Belum ada operator terdaftar.</div>
                  ) : (
                    operatorStaff.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="font-medium hover:bg-slate-50">
                        {u.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nomor Loket</label>
              <Select value={loket} onValueChange={setLoket}>
                <SelectTrigger className="w-full h-[48px] bg-white/60 border-white/60 text-sm rounded-xl font-medium focus:ring-4 focus:ring-primary/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-lg border-slate-200 rounded-xl">
                  {LOKET_NUMBERS.map((n) => (
                    <SelectItem key={n} value={String(n)} className="font-medium hover:bg-slate-50">Loket {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 services-dropdown relative">
              <label className="text-sm font-bold text-slate-700">Layanan yang Ditangani</label>
              <button
                type="button"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="w-full h-[48px] bg-white/60 border border-white/60 text-sm rounded-xl font-medium px-3 flex items-center justify-between hover:bg-white/80 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                <span className={services.length === 0 ? "text-slate-500" : "text-slate-800"}>
                  {services.length === 0 
                    ? "Pilih layanan..." 
                    : `${services.length} layanan dipilih`}
                </span>
                <div className="text-slate-400">▼</div>
              </button>
              
              {isServicesOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white shadow-xl border border-slate-200 rounded-xl z-10 flex flex-col gap-1">
                  {SERVICES.map((s) => {
                    const active = services.includes(s.code);
                    return (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => toggleService(s.code)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all text-left font-bold ${
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${active ? 'bg-primary border-primary text-white' : 'border-slate-300'}`}>
                          {active && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="truncate">{s.name} ({s.code})</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full bg-white/60 border border-white/60 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
              />
            </div>

            <CustomButton
              type="submit"
              variant="primary"
              className="w-full py-4 text-base mt-4"
              disabled={!selectedStaffId || !password || services.length === 0}
            >
              <User size={20} /> Masuk
            </CustomButton>
          </form>
        </div>
      </div>
"""

    content = content[:start_idx] + new_component + content[end_idx:]
    
    with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
        f.write(content)
    print("Success updating OperatorLoginForm")
else:
    print("Could not find start or end markers")
