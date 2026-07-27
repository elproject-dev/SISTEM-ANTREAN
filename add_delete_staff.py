import re

with open('apps/sistem-antrean/src/hooks/useQueue.ts', 'r') as f:
    content = f.read()

# Add deleteStaff interface
interface_old = "  updateStaff: (id: string, data: Partial<StaffUser>) => void;"
interface_new = "  updateStaff: (id: string, data: Partial<StaffUser>) => void;\n  deleteStaff: (id: string) => void;"
content = content.replace(interface_old, interface_new)

# Add deleteStaff implementation right after updateStaff
impl_old = """  const updateStaff = useCallback((id: string, data: Partial<StaffUser>) => {
    setState((prev) => {
      const staffIndex = prev.staffUsers.findIndex((s) => s.id === id);
      if (staffIndex === -1) return prev;
      const newStaff = [...prev.staffUsers];
      newStaff[staffIndex] = { ...newStaff[staffIndex], ...data };
      return { ...prev, staffUsers: newStaff };
    });
  }, []);"""

impl_new = """  const updateStaff = useCallback((id: string, data: Partial<StaffUser>) => {
    setState((prev) => {
      const staffIndex = prev.staffUsers.findIndex((s) => s.id === id);
      if (staffIndex === -1) return prev;
      const newStaff = [...prev.staffUsers];
      newStaff[staffIndex] = { ...newStaff[staffIndex], ...data };
      return { ...prev, staffUsers: newStaff };
    });
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      staffUsers: prev.staffUsers.filter((s) => s.id !== id),
    }));
  }, []);"""
content = content.replace(impl_old, impl_new)

# Add deleteStaff to the returned object
ret_old = """    updateStaff,"""
ret_new = """    updateStaff,\n    deleteStaff,"""
content = content.replace(ret_old, ret_new)

with open('apps/sistem-antrean/src/hooks/useQueue.ts', 'w') as f:
    f.write(content)

print("Success adding deleteStaff to useQueue")
