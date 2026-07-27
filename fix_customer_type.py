import re

with open('apps/sistem-antrean/src/pages/AntreanPage.tsx', 'r') as f:
    content = f.read()

# 1. Update state
old_state = "  const [customerType, setCustomerType] = useState<'offline' | 'online' | 'priority'>('offline');"
new_state = "  const [customerType, setCustomerType] = useState<'offline' | 'online' | 'priority' | 'none'>('none');"
content = content.replace(old_state, new_state)

# 2. Add validation
old_validation = """  const handleAddOffline = (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceCode || serviceCode === 'none') {"""
new_validation = """  const handleAddOffline = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerType || customerType === 'none') {
      setShowError('❌ Silakan pilih tipe pelanggan terlebih dahulu!');
      setTimeout(() => setShowError(''), 3000);
      return;
    }
    if (!serviceCode || serviceCode === 'none') {"""
content = content.replace(old_validation, new_validation)

# 3. Update component options
old_jsx = """              <CustomSelect
                label="Tipe Pelanggan"
                required
                value={customerType}
                onValueChange={(val) => setCustomerType(val as 'offline' | 'online' | 'priority')}
                options={[
                  { value: 'offline', label: <span className="font-medium text-slate-700">Offline</span> },"""
new_jsx = """              <CustomSelect
                label="Tipe Pelanggan"
                required
                placeholder="Belum dipilih"
                value={customerType}
                onValueChange={(val) => setCustomerType(val as 'offline' | 'online' | 'priority' | 'none')}
                options={[
                  { value: 'none', label: <span className="text-slate-500">Belum dipilih</span> },
                  { value: 'offline', label: <span className="font-medium text-slate-700">Offline</span> },"""
content = content.replace(old_jsx, new_jsx)

# Also fix the cast in addOfflineTicket
old_add = "    const t = addOfflineTicket(serviceCode as ServiceCode, undefined, customerType);"
new_add = "    const t = addOfflineTicket(serviceCode as ServiceCode, undefined, customerType as 'offline' | 'online' | 'priority');"
content = content.replace(old_add, new_add)


with open('apps/sistem-antrean/src/pages/AntreanPage.tsx', 'w') as f:
    f.write(content)

print("Success updating customerType logic")
