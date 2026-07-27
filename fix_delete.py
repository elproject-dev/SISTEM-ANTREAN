import re

with open('apps/sistem-antrean/src/hooks/useQueue.ts', 'r') as f:
    content = f.read()

impl_old = "  }, [setState]);\\n\\n  const updateStaffStatus"
impl_new = """  }, [setState]);

  const deleteStaff = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      staffUsers: (prev.staffUsers || []).filter(s => s.id !== id)
    }));
  }, [setState]);

  const updateStaffStatus"""

content = content.replace(impl_old, impl_new)

with open('apps/sistem-antrean/src/hooks/useQueue.ts', 'w') as f:
    f.write(content)

print("Success injecting deleteStaff implementation")
